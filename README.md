# TicTacToe RL
# 🎮 Tic-Tac-Toe with Reinforcement Learning AI

A full-stack web application where you play Tic-Tac-Toe against an AI trained using **Reinforcement Learning**. The AI learned how to play entirely on its own — it was never given any rules or hardcoded strategies. It discovered optimal play through thousands of games of trial and error.

**Live Demo:** [Your Vercel URL here]  
**Backend API:** https://tic-tac-toe-10mb.onrender.com/docs

---

## 📖 Table of Contents

- [How to Play](#how-to-play)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How the AI Was Trained](#how-the-ai-was-trained)
- [How the System Works End-to-End](#how-the-system-works-end-to-end)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Key Concepts Explained](#key-concepts-explained)

---

## How to Play

1. Visit the live site
2. You play as **X**, the AI plays as **O**
3. Click any empty square to make your move
4. The AI will respond after a short thinking delay
5. First to get 3 in a row wins!
6. Press **Reset Game** to start over

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | User interface and game board |
| Backend | FastAPI (Python) | API server that runs the AI model |
| ML Model | MaskablePPO (Stable-Baselines3) | Reinforcement learning algorithm |
| Game Environment | Gymnasium | Standardized RL training interface |
| Frontend Hosting | Vercel | Hosts the React app |
| Backend Hosting | Render | Hosts the Python API server |

---

## Project Structure

```
tictactoe-rl/
│
├── training/                    # Machine learning code
│   ├── environment/
│   │   ├── tictactoe.py         # Core game logic (rules, win detection)
│   │   └── tictactoe_env.py     # Gymnasium wrapper for RL training
│   ├── models/
│   │   └── tictactoe_ppo.zip    # Trained model file
│   └── train.py                 # Training script
│
├── backend/                     # FastAPI server
│   ├── models/
│   │   └── tictactoe_ppo.zip    # Trained model (copy for deployment)
│   ├── app.py                   # API server code
│   └── requirements.txt         # Python dependencies
│
└── frontend/                    # React application
    ├── src/
    │   ├── App.jsx              # Main game component
    │   └── App.css              # Styling
    └── package.json
```

---

## How the AI Was Trained

### The Core Idea: Learning Through Self-Play

The AI was **not** programmed with rules like "block the opponent" or "take the center". Instead, it learned by playing thousands of games against a random opponent, receiving rewards based on outcomes, and gradually improving its strategy.

This is called **Reinforcement Learning (RL)** — the same family of techniques used to train AlphaGo and game-playing AIs at DeepMind.

### Step 1: The Game Environment (`tictactoe.py`)

First, the game logic was written as a standalone Python class:

- The board is a 3×3 NumPy array
- Player 1 is represented by `1`, Player 2 by `2`, empty by `0`
- Win detection checks all 8 possible lines (3 rows, 3 columns, 2 diagonals)
- The **reward system** is what teaches the AI:
  - Win → `+1` reward
  - Lose → `-1` reward
  - Draw or ongoing → `0` reward

### Step 2: The Gymnasium Wrapper (`tictactoe_env.py`)

To use standard RL libraries, the game was wrapped in a **Gymnasium environment** — a universal interface that all RL algorithms understand.

This wrapper defines:
- **Observation space:** What the AI "sees" — the 3×3 board state
- **Action space:** What the AI can do — choose any of 9 positions (0-8)
- **`action_masks()`:** A boolean array telling the AI which moves are currently legal (empty squares only)
- **`step()`:** Executes one full turn — the AI moves, then a random opponent responds

The random opponent is intentional. Training against randomness teaches the AI to handle any situation, not just exploit a specific opponent's weaknesses.

### Step 3: Training with MaskablePPO (`train.py`)

The algorithm used is **MaskablePPO** (Proximal Policy Optimization with action masking) from the `sb3-contrib` library.

**Why PPO?**
PPO is a modern, stable RL algorithm that works well for discrete action spaces like board games. It uses a neural network (the "policy") to map board states to move probabilities, and updates the network to make winning moves more likely over time.

**Why "Maskable"?**
Standard PPO might try to place a piece on an already-occupied square. Action masking prevents this by zeroing out the probability of illegal moves before the AI makes a decision. This dramatically speeds up training because the AI never wastes time learning that illegal moves are bad.

**Training configuration:**
```python
model = MaskablePPO(
    "MlpPolicy",          # Multi-layer perceptron neural network
    env,                  # The Gymnasium environment
    learning_rate=0.0003, # How fast the network updates
    verbose=1
)
model.learn(total_timesteps=100_000)  # 100,000 moves of experience
```

**Training results:**
After 100,000 timesteps, the model was tested in 10 games against a random opponent:
- **Wins: 10/10**
- **Losses: 0/10**
- **Draws: 0/10**

The AI achieved perfect play against a random opponent, demonstrating it had learned a solid strategy.

---

## How the System Works End-to-End

Here is exactly what happens when you click a square:

```
1. You click square 4 (center)
   ↓
2. React updates the board: ['X', null, null, null, null, null, null, null, null]
   ↓
3. React checks if you won (you didn't)
   ↓
4. React waits 500ms (simulated "thinking" delay for natural feel)
   ↓
5. React sends a POST request to the FastAPI backend:
   {
     "board": ["X", null, null, null, null, null, null, null, null]
   }
   ↓
6. FastAPI receives the board and converts it:
   ["X", null, null, ...] → numpy array [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
   (X=1, O=2, empty=0)
   ↓
7. FastAPI calculates which squares are empty (action masks)
   ↓
8. The MaskablePPO model processes the board state through its neural network
   and returns the best move (e.g., move 0 = top-left corner)
   ↓
9. FastAPI returns: {"move": 0}
   ↓
10. React places 'O' at position 0, updates the board display
    ↓
11. React checks if the AI won → game continues or ends
```

### Board Position Reference

```
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8
```

---

## Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/tictactoe-rl.git
cd tictactoe-rl
```

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```

The API will be live at `http://localhost:8000`  
Visit `http://localhost:8000/docs` to test the API interactively.

### 3. Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The game will open at `http://localhost:5173`

### 4. (Optional) Retrain the Model

```bash
cd training
pip install gymnasium stable-baselines3 sb3-contrib numpy
python train.py
```

The trained model will be saved to `training/models/tictactoe_ppo.zip`.  
Copy it to `backend/models/` to use it in the API.

---

## Deployment

### Backend → Render.com

The FastAPI backend (including the trained model `.zip` file) is deployed as a Python web service on [Render](https://render.com).

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Root directory:** `backend`

> Note: The free tier spins down after 15 minutes of inactivity. The first request after sleep may take 30-60 seconds while the service wakes up.

### Frontend → Vercel

The React frontend is deployed on [Vercel](https://vercel.com).

- **Framework:** Vite
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output directory:** `dist`

The frontend is configured to call the Render backend URL for all AI predictions.

---

## Key Concepts Explained

### Reinforcement Learning (RL)
A type of machine learning where an agent learns by interacting with an environment. It receives rewards for good actions and penalties for bad ones, gradually learning a strategy (called a "policy") that maximizes total reward.

### Policy
The AI's decision-making function. It takes a board state as input and outputs probabilities for each possible move. During training, the policy is updated to make winning moves more likely.

### Action Masking
A technique that prevents the AI from selecting illegal moves (occupied squares) by setting their probability to zero before sampling. Without this, the AI wastes learning capacity on moves that are never valid.

### PPO (Proximal Policy Optimization)
A state-of-the-art RL algorithm that updates the policy in small, stable steps. It prevents the network from changing too drastically in a single update, which makes training reliable and consistent.

### Gymnasium
An open-source Python library (maintained by Farama Foundation) that provides a standard interface for RL environments. By implementing the `env.step()`, `env.reset()`, and `env.observation_space` interface, any RL algorithm can train on any environment.

### Self-Play / Random Opponent Training
The AI trains by playing against a random opponent — an agent that picks moves randomly. This exposes the AI to diverse board states and teaches it to handle any situation. The AI learns that certain moves consistently lead to wins regardless of what the opponent does.

---

## Results

| Metric | Value |
|--------|-------|
| Training timesteps | 100,000 |
| Test games vs random | 10 |
| Wins | 10 (100%) |
| Losses | 0 (0%) |
| Draws | 0 (0%) |

The trained AI plays optimally against random opponents and provides a challenging experience for human players.

---

## Built With

- [Stable-Baselines3](https://stable-baselines3.readthedocs.io/) — RL algorithms
- [sb3-contrib](https://sb3-contrib.readthedocs.io/) — MaskablePPO implementation
- [Gymnasium](https://gymnasium.farama.org/) — RL environment interface
- [FastAPI](https://fastapi.tiangolo.com/) — Python web framework
- [React](https://react.dev/) — Frontend UI library
- [Vite](https://vitejs.dev/) — Frontend build tool