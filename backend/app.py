from fastapi import FastAPI
from pydantic import BaseModel
from sb3_contrib import MaskablePPO
import numpy as np


app = FastAPI()

model = None

class BoardState(BaseModel):
    board: list



@app.on_event("startup")
def load_model():
    
    global model
    model = MaskablePPO.load("models/tictactoe_ppo.zip")
    pass

def convert_board_to_array(board):
    converted = []

    for value in board:
        if value =="X":
            converted.append(1)
        elif value == "O":
            converted.append(2)
        else:
            converted.append(0)

    return np.array(converted).reshape(3,3)

@app.post("/predict")
def predict_moves(board_state: BoardState):
    board = board_state.board
    new_board = convert_board_to_array(board)
    action, _ = model.predict(new_board, deterministic=True) 
    return {"move": int(action)}  
