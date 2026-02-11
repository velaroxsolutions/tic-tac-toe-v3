import { useState } from 'react'
import './App.css'

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [winner, setWinner] = useState(null)

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }

    if (squares.every((square) => square !== null)) {
      return 'Draw'
    }

    return null
  }
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))


  const handleClick = async (index) => {
    // Guard clauses
    if (board[index]) return
    if (winner) return

    // Human makes move (X)
    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    // Check if human won
    const humanWinner = checkWinner(newBoard)
    if (humanWinner) {
      setWinner(humanWinner)
      return
    }

    // AI's turn - call backend
    await sleep(500)  // ← Wait 500ms (0.5 seconds) before AI responds

    // AI's turn - call backend
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ board: newBoard })
    })
    const data = await response.json()
    const aiMove = data.move
    console.log("Board sent to AI:", newBoard)  // ← ADD THIS
    console.log("AI chose move:", aiMove)        // ← ADD THIS


    // Place AI's move (O)
    const aiBoard = [...newBoard]
    aiBoard[aiMove] = 'O'
    console.log("Board after AI move:", aiBoard)  // ← ADD THIS

    setBoard(aiBoard)

    // Check if AI won
    const aiWinner = checkWinner(aiBoard)
    if (aiWinner) {
      setWinner(aiWinner)
      return
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setWinner(null)
  }

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>

      <div className="status">
        {winner ? (
          winner === 'Draw' ? 'Game is a Draw!' : `Winner: ${winner}`
        ) : (
          'Your turn! (X)'
        )}
      </div>

      <div className="board">
        {board.map((value, i) => (
          <div
            key={i}
            className="square"
            onClick={() => handleClick(i)}
          >
            {value}
          </div>
        ))}
      </div>

      <button onClick={resetGame}>Reset Game</button>
    </div>
  )
}

export default App