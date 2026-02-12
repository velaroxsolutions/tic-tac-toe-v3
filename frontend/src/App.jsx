import { useState } from 'react'
import './App.css'

function App() {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [winner, setWinner] = useState(null)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)

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
    if (squares.every((square) => square !== null)) return 'Draw'
    return null
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const handleClick = async (index) => {
    if (board[index]) return
    if (winner) return
    if (isThinking) return  // ← Prevent clicking while AI is thinking

    setError(null)  // Clear any previous error

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    const humanWinner = checkWinner(newBoard)
    if (humanWinner) {
      setWinner(humanWinner)
      return
    }

    await sleep(500)
    setIsThinking(true)  // ← Start thinking

    try {
      const response = await fetch('https://tic-tac-toe-10mb.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: newBoard })
      })

      if (!response.ok) throw new Error('Backend error')

      const data = await response.json()
      const aiMove = data.move

      const aiBoard = [...newBoard]
      aiBoard[aiMove] = 'O'
      setBoard(aiBoard)

      const aiWinner = checkWinner(aiBoard)
      if (aiWinner) {
        setWinner(aiWinner)
      }

    } catch (err) {
      // Show friendly message if Render is waking up
      setError('⏳ AI is waking up from sleep... Please click your square again in a moment!')
      // Undo the human's move so they can retry
      setBoard(board)
    } finally {
      setIsThinking(false)  // ← Always stop thinking
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setWinner(null)
    setError(null)
    setIsThinking(false)
  }

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>

      <div className="status">
        {winner ? (
          winner === 'Draw' ? 'Game is a Draw!' : `Winner: ${winner}`
        ) : isThinking ? (
          'AI is thinking...'
        ) : (
          'Your turn! (X)'
        )}
      </div>

      {/* Warning banner when Render is waking up */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="board">
        {board.map((value, i) => (
          <div
            key={i}
            className={`square ${isThinking ? 'disabled' : ''}`}
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