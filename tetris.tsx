"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { ModernButton } from "@/components/modern-button"
import { motion, AnimatePresence } from "framer-motion"
import {
  Music,
  Pause,
  Play,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  X,
} from "lucide-react"
import { ThemeProvider, useTheme } from "@/context/theme-context"
import { ThemeSelector } from "@/components/theme-selector"

// Update the TETROMINOS color scheme
const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: "bg-cyan-400 border-cyan-500" },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "bg-blue-400 border-blue-500",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "bg-orange-400 border-orange-500",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-yellow-400 border-yellow-500",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "bg-emerald-400 border-emerald-500",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "bg-purple-400 border-purple-500",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "bg-rose-400 border-rose-500",
  },
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const INITIAL_DROP_TIME = 800
const SPEED_INCREASE_FACTOR = 0.95

const createEmptyBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0))

const randomTetromino = () => {
  const keys = Object.keys(TETROMINOS)
  const randKey = keys[Math.floor(Math.random() * keys.length)]
  return {
    type: randKey,
    ...TETROMINOS[randKey],
  }
}

function TetrisGame() {
  const { colors } = useTheme()
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(null)
  const [nextPiece, setNextPiece] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [dropTime, setDropTime] = useState(INITIAL_DROP_TIME)
  const [level, setLevel] = useState(1)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [completedRows, setCompletedRows] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [highScore, setHighScore] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const audioRef = useRef(null)
  const dropInterval = useRef(null)

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem("tetrisHighScore")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  const checkCollision = useCallback(
    (x, y, shape) => {
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] !== 0) {
            const newX = x + col
            const newY = y + row
            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX] !== 0)) {
              return true
            }
          }
        }
      }
      return false
    },
    [board],
  )

  const isValidMove = useCallback((x, y, shape) => !checkCollision(x, y, shape), [checkCollision])

  const moveLeft = useCallback(() => {
    if (currentPiece && !isPaused && isValidMove(currentPiece.x - 1, currentPiece.y, currentPiece.shape)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x - 1 }))
    }
  }, [currentPiece, isPaused, isValidMove])

  const moveRight = useCallback(() => {
    if (currentPiece && !isPaused && isValidMove(currentPiece.x + 1, currentPiece.y, currentPiece.shape)) {
      setCurrentPiece((prev) => ({ ...prev, x: prev.x + 1 }))
    }
  }, [currentPiece, isPaused, isValidMove])

  const moveDown = useCallback(() => {
    if (!currentPiece || isPaused) return
    if (isValidMove(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }))
    } else {
      placePiece()
    }
  }, [currentPiece, isPaused, isValidMove])

  const hardDrop = useCallback(() => {
    if (!currentPiece || isPaused) return
    let dropY = currentPiece.y
    while (isValidMove(currentPiece.x, dropY + 1, currentPiece.shape)) {
      dropY += 1
    }
    setCurrentPiece((prev) => ({ ...prev, y: dropY }))
    placePiece()
  }, [currentPiece, isPaused, isValidMove])

  const rotate = useCallback(() => {
    if (!currentPiece || isPaused) return
    const rotated = currentPiece.shape[0].map((_, i) => currentPiece.shape.map((row) => row[i]).reverse())
    let newX = currentPiece.x
    let newY = currentPiece.y

    // Try to rotate, if not possible, try to adjust position
    if (!isValidMove(newX, newY, rotated)) {
      // Try to move left
      if (isValidMove(newX - 1, newY, rotated)) {
        newX -= 1
      }
      // Try to move right
      else if (isValidMove(newX + 1, newY, rotated)) {
        newX += 1
      }
      // Try to move up
      else if (isValidMove(newX, newY - 1, rotated)) {
        newY -= 1
      }
      // If still not possible, don't rotate
      else {
        return
      }
    }

    setCurrentPiece((prev) => ({
      ...prev,
      x: newX,
      y: newY,
      shape: rotated,
    }))
  }, [currentPiece, isPaused, isValidMove])

  const placePiece = useCallback(() => {
    if (!currentPiece) return
    const newBoard = board.map((row) => [...row])
    currentPiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + currentPiece.y
          const boardX = x + currentPiece.x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = currentPiece.color
          }
        }
      })
    })
    setBoard(newBoard)
    clearLines(newBoard)
    spawnNewPiece()
  }, [currentPiece, board])

  const clearLines = useCallback(
    (newBoard) => {
      const linesCleared = []
      const updatedBoard = newBoard.filter((row, index) => {
        if (row.every((cell) => cell !== 0)) {
          linesCleared.push(index)
          return false
        }
        return true
      })

      if (linesCleared.length > 0) {
        setCompletedRows(linesCleared)
        setTimeout(() => {
          while (updatedBoard.length < BOARD_HEIGHT) {
            updatedBoard.unshift(Array(BOARD_WIDTH).fill(0))
          }
          setBoard(updatedBoard)
          setCompletedRows([])

          // Award points based on number of lines cleared
          const linePoints = [0, 100, 300, 500, 800] // 0, 1, 2, 3, 4 lines
          const newScore = score + linePoints[linesCleared.length]
          setScore(newScore)

          // Level up every 5 lines cleared
          if (Math.floor(newScore / 500) > level - 1) {
            setLevel((prev) => prev + 1)
            setDropTime((prev) => prev * SPEED_INCREASE_FACTOR)
          }
        }, 300)
      }
    },
    [score, level],
  )

  const spawnNewPiece = useCallback(() => {
    let newNextPiece = nextPiece
    if (!newNextPiece) {
      newNextPiece = randomTetromino()
    }

    const newPiece = {
      x: Math.floor(BOARD_WIDTH / 2) - 1,
      y: 0,
      shape: newNextPiece.shape,
      color: newNextPiece.color,
      type: newNextPiece.type,
    }

    if (checkCollision(newPiece.x, newPiece.y, newPiece.shape)) {
      setGameOver(true)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem("tetrisHighScore", score.toString())
      }
    } else {
      setCurrentPiece(newPiece)
      setNextPiece(randomTetromino())
    }
  }, [checkCollision, nextPiece, score, highScore])

  useEffect(() => {
    if (!currentPiece && !gameOver && !showStartScreen) {
      spawnNewPiece()
    }
  }, [currentPiece, gameOver, spawnNewPiece, showStartScreen])

  useEffect(() => {
    if (!gameOver && !isPaused && !showStartScreen) {
      dropInterval.current = setInterval(moveDown, dropTime)
    } else {
      clearInterval(dropInterval.current)
    }
    return () => clearInterval(dropInterval.current)
  }, [moveDown, gameOver, isPaused, dropTime, showStartScreen])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver || showStartScreen) return

      if (e.key === "Escape") {
        setIsPaused((prev) => !prev)
        return
      }

      if (isPaused) return

      switch (e.key) {
        case "ArrowLeft":
          moveLeft()
          break
        case "ArrowRight":
          moveRight()
          break
        case "ArrowDown":
          moveDown()
          break
        case "ArrowUp":
          rotate()
          break
        case " ":
          hardDrop()
          break
        default:
          break
      }
    }
    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [moveLeft, moveRight, moveDown, rotate, hardDrop, gameOver, isPaused, showStartScreen])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3
      audioRef.current.loop = true
      if (!gameOver && isMusicPlaying && !isPaused) {
        audioRef.current.play().catch((error) => console.error("Audio playback failed:", error))
      } else {
        audioRef.current.pause()
      }
    }
  }, [gameOver, isMusicPlaying, isPaused])

  const startGame = () => {
    resetGame()
    setShowStartScreen(false)
    if (isMusicPlaying) {
      audioRef.current.play().catch(() => {})
    }
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPiece(null)
    setNextPiece(null)
    setScore(0)
    setGameOver(false)
    setDropTime(INITIAL_DROP_TIME)
    setLevel(1)
    setCompletedRows([])
    setIsPaused(false)
    clearInterval(dropInterval.current)
  }

  const togglePause = () => {
    setIsPaused((prev) => !prev)
  }

  const toggleMusic = () => {
    setIsMusicPlaying(!isMusicPlaying)
  }

  const renderCell = (x, y) => {
    if (
      currentPiece &&
      !isPaused &&
      y >= currentPiece.y &&
      y < currentPiece.y + currentPiece.shape.length &&
      x >= currentPiece.x &&
      x < currentPiece.x + currentPiece.shape[0].length &&
      currentPiece.shape[y - currentPiece.y][x - currentPiece.x]
    ) {
      return currentPiece.color
    }
    return board[y][x]
  }

  // Find the ghost piece position (where the piece would land if dropped)
  const getGhostPosition = () => {
    if (!currentPiece || isPaused) return null

    let ghostY = currentPiece.y
    while (isValidMove(currentPiece.x, ghostY + 1, currentPiece.shape)) {
      ghostY += 1
    }

    if (ghostY === currentPiece.y) return null

    return {
      x: currentPiece.x,
      y: ghostY,
      shape: currentPiece.shape,
    }
  }

  const ghost = getGhostPosition()

  const renderNextPiece = () => {
    if (!nextPiece) return null

    return (
      <div
        className="grid bg-gray-800/30 p-2 rounded"
        style={{
          gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)`,
          gap: "2px",
          justifyContent: "center",
        }}
      >
        {nextPiece.shape.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`next-${y}-${x}`}
              className={`w-4 h-4 md:w-5 md:h-5 ${cell ? nextPiece.color : "bg-transparent"}`}
              style={{ borderRadius: "2px" }}
            />
          )),
        )}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${colors.background} ${colors.text}`}>
      {/* Theme Selector - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeSelector />
      </div>

      {/* Start Screen */}
      <AnimatePresence>
        {showStartScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-30 flex flex-col items-center justify-center ${colors.background} p-4`}
          >
            <motion.h1
              className={`text-6xl md:text-8xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r ${colors.accent}`}
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              TETRIS
            </motion.h1>

            <motion.div
              className="flex flex-col gap-4 items-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xl mb-2">High Score: {highScore}</p>
              <ModernButton
                onClick={startGame}
                size="xl"
                className={`bg-gradient-to-r ${colors.accent} hover:${colors.accentHover} rounded-lg shadow-lg transition-all duration-300 hover:shadow-lg hover:scale-105`}
              >
                Start Game
              </ModernButton>

              <div className="flex gap-4 mt-4">
                <ModernButton onClick={toggleMusic} variant="outline">
                  <Music className="w-4 h-4 mr-2" />
                  {isMusicPlaying ? "Mute" : "Music"}
                </ModernButton>

                <ModernButton onClick={() => setShowInstructions(true)} variant="outline">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  How to Play
                </ModernButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={`${colors.panelBackground} rounded-xl p-6 max-w-md w-full border border-gray-700 shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">How to Play</h2>
                <ModernButton
                  variant="ghost"
                  onClick={() => setShowInstructions(false)}
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <X />
                </ModernButton>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-1">Controls:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ChevronLeft className="mr-2 text-blue-400" /> Left Arrow: Move Left
                    </li>
                    <li className="flex items-center">
                      <ChevronRight className="mr-2 text-blue-400" /> Right Arrow: Move Right
                    </li>
                    <li className="flex items-center">
                      <ChevronDown className="mr-2 text-blue-400" /> Down Arrow: Move Down
                    </li>
                    <li className="flex items-center">
                      <RotateCw className="mr-2 text-blue-400" /> Up Arrow: Rotate
                    </li>
                    <li className="flex items-center">Space: Hard Drop</li>
                    <li className="flex items-center">Esc: Pause/Resume</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-1">Objective:</h3>
                  <p>
                    Clear lines by filling them with blocks. The more lines you clear at once, the more points you earn!
                  </p>
                </div>

                <div>
                  <h3 className="font-bold mb-1">Scoring:</h3>
                  <ul className="space-y-1">
                    <li>1 line: 100 points</li>
                    <li>2 lines: 300 points</li>
                    <li>3 lines: 500 points</li>
                    <li>4 lines: 800 points</li>
                  </ul>
                </div>
              </div>

              <ModernButton
                onClick={() => setShowInstructions(false)}
                className={`w-full mt-6 bg-gradient-to-r ${colors.accent}`}
              >
                Got it!
              </ModernButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Header */}
      <div className="mb-4 text-center">
        <h1 className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${colors.accent}`}>TETRIS</h1>
        <p className="text-lg opacity-75">Level: {level}</p>
      </div>

      {/* Main Game Container */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start justify-center gap-4 p-4">
        {/* Game Info Panel (mobile: top, desktop: left) */}
        <div
          className={`${isMobile ? "w-full" : "w-40"} flex ${isMobile ? "flex-row justify-between" : "flex-col"} ${colors.panelBackground} backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-xl`}
        >
          <div className={`${isMobile ? "text-left" : "mb-6"}`}>
            <h2 className="text-lg font-bold">Score</h2>
            <p className={`text-2xl font-bold ${colors.buttonOutlineText}`}>{score}</p>
            <p className="text-sm opacity-75">High: {highScore}</p>
          </div>

          {!isMobile && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Next</h2>
              {renderNextPiece()}
            </div>
          )}

          {isMobile && nextPiece && (
            <div>
              <h2 className="text-lg font-bold mb-1">Next</h2>
              {renderNextPiece()}
            </div>
          )}

          {!isMobile && (
            <div className="mt-auto space-y-2">
              <ModernButton
                onClick={togglePause}
                className="w-full"
                variant="outline"
                disabled={gameOver || showStartScreen}
              >
                {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                {isPaused ? "Resume" : "Pause"}
              </ModernButton>

              <ModernButton onClick={toggleMusic} className="w-full" variant="outline">
                <Music className="mr-2 h-4 w-4" />
                {isMusicPlaying ? "Mute" : "Music"}
              </ModernButton>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="relative">
          {/* Pause Overlay */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-xl"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">PAUSED</h2>
                  <ModernButton onClick={togglePause}>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </ModernButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameOver && !showStartScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl"
              >
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center p-6">
                  <h2 className={`text-3xl font-bold mb-2 ${colors.gameOver}`}>GAME OVER</h2>
                  <p className="text-xl mb-1">Score: {score}</p>
                  <p className="text-md mb-4">High Score: {highScore}</p>
                  <div className="flex gap-3 justify-center">
                    <ModernButton onClick={resetGame} className={`bg-gradient-to-r ${colors.accent}`}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Play Again
                    </ModernButton>
                    <ModernButton onClick={() => setShowStartScreen(true)} variant="outline">
                      Main Menu
                    </ModernButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Game Board */}
          <div
            className={`${colors.gameBackground} backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-xl overflow-hidden`}
          >
            <div
              className={`grid ${colors.gameBackground} rounded-lg overflow-hidden`}
              style={{
                gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                width: `${BOARD_WIDTH * (isMobile ? 16 : 24)}px`,
                height: `${BOARD_HEIGHT * (isMobile ? 16 : 24)}px`,
                gap: "1px",
              }}
            >
              {board.map((row, y) =>
                row.map((_, x) => {
                  // Draw ghost piece (semi-transparent preview of where piece will land)
                  const isGhostCell =
                    ghost &&
                    y >= ghost.y &&
                    y < ghost.y + ghost.shape.length &&
                    x >= ghost.x &&
                    x < ghost.x + ghost.shape[0].length &&
                    ghost.shape[y - ghost.y][x - ghost.x]

                  const cellColor = renderCell(x, y)

                  return (
                    <AnimatePresence key={`${y}-${x}`}>
                      <motion.div
                        initial={false}
                        animate={{
                          opacity: completedRows.includes(y) ? 0 : isGhostCell ? 0.3 : 1,
                          scale: completedRows.includes(y) ? 1.1 : 1,
                          background:
                            isGhostCell && !cellColor
                              ? currentPiece
                                ? currentPiece.color.split(" ")[0]
                                : "transparent"
                              : undefined,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`w-4 h-4 md:w-6 md:h-6 ${cellColor || "bg-gray-900"} ${cellColor ? "border border-white/20 shadow-inner" : ""} rounded-sm`}
                      />
                    </AnimatePresence>
                  )
                }),
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          {isMobile && !gameOver && !showStartScreen && (
            <div className="mt-6">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <ModernButton variant="outline" className="py-6" onClick={moveLeft} disabled={isPaused}>
                  <ChevronLeft size={24} />
                </ModernButton>
                <ModernButton variant="outline" className="py-6" onClick={hardDrop} disabled={isPaused}>
                  ▼▼
                </ModernButton>
                <ModernButton variant="outline" className="py-6" onClick={moveRight} disabled={isPaused}>
                  <ChevronRight size={24} />
                </ModernButton>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <ModernButton variant="outline" className="py-6" onClick={rotate} disabled={isPaused}>
                  <RotateCw size={20} />
                </ModernButton>
                <ModernButton variant="outline" className="py-6" onClick={moveDown} disabled={isPaused}>
                  <ChevronDown size={24} />
                </ModernButton>
                <ModernButton variant={isPaused ? "default" : "outline"} className="py-6" onClick={togglePause}>
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </ModernButton>
              </div>

              <div className="flex gap-2 mt-4">
                <ModernButton variant="outline" className="flex-1" onClick={toggleMusic}>
                  <Music className="mr-2 h-4 w-4" />
                  {isMusicPlaying ? "Mute" : "Music"}
                </ModernButton>
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowInstructions(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help
                </ModernButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard Controls Info */}
      {!isMobile && !showStartScreen && (
        <div className="mt-6 text-center text-sm text-white/70">
          <p>Controls: Arrow Keys to move | Up Arrow to rotate | Space to hard drop | Esc to pause</p>
        </div>
      )}

      <audio
        ref={audioRef}
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tetris-kxnh5j7hpNEcFspAndlU2huV5n6dvk.mp3"
      />
    </div>
  )
}

export default function Tetris() {
  return (
    <ThemeProvider>
      <TetrisGame />
    </ThemeProvider>
  )
}

