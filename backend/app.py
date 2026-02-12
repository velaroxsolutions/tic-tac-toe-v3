from fastapi import FastAPI
from pydantic import BaseModel
from sb3_contrib import MaskablePPO
import numpy as np
from fastapi.middleware.cors import CORSMiddleware  # ← Add this import
import os


app = FastAPI()

model = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (fine for development)
    allow_methods=["*"],
    allow_headers=["*"],
)


class BoardState(BaseModel):
    board: list


@app.on_event("startup")
def load_model():
    global model
    
    # Get the directory where app.py lives
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "models", "tictactoe_ppo")
    
    model = MaskablePPO.load(
        model_path,
        custom_objects={"clip_range": 0.2, "lr_schedule": 0.0003}
    )


def convert_board_to_array(board):
    converted = []

    for value in board:
        if value == "X":
            converted.append(1)
        elif value == "O":
            converted.append(2)
        else:
            converted.append(0)

    return np.array(converted, dtype=np.int8).reshape(3, 3)  # ← Add dtype=np.int8


def get_action_masks(board_array):
    # Flatten 3x3 to 1D array
    flat = board_array.flatten()
    # True = empty square (valid move), False = occupied
    return np.array([flat[i] == 0 for i in range(9)])


@app.post("/predict")
def predict_moves(board_state: BoardState):
    board = board_state.board
    new_board = convert_board_to_array(board)

    # Get action masks
    action_masks = get_action_masks(new_board)

    # Predict WITH action masks
    action, _ = model.predict(
        new_board,
        deterministic=True,
        action_masks=action_masks,  # ← THIS IS THE KEY FIX!
    )
    return {"move": int(action)}
