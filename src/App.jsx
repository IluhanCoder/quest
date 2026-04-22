import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import confetti from 'canvas-confetti'
import { QUESTIONS_BY_STATION } from './data/questions'
import { RESULTS_BY_STATION } from './data/results'

const TARGET_SCORE = 12

function createInitialState(stationQuestions) {
  return {
    queue: stationQuestions.map((question) => question.id),
    score: 0,
    selectedIndex: null,
    completed: false,
  }
}

function StationQuiz() {
  const { stationId } = useParams()
  const stationNumber = Number(stationId)
  const stationQuestions = QUESTIONS_BY_STATION[stationNumber]
  const successMessage = RESULTS_BY_STATION[stationNumber]

  if (!stationQuestions || !successMessage) {
    return (
      <main className="app-shell">
        <div className="card">
          <h1>Невірний номер станції</h1>
          <p>Використайте адресу у форматі /1, /2, /3, /4 або /5.</p>
        </div>
      </main>
    )
  }

  const [state, setState] = useState(() => createInitialState(stationQuestions))

  const questionsById = useMemo(() => {
    return Object.fromEntries(stationQuestions.map((question) => [question.id, question]))
  }, [stationQuestions])

  const currentQuestionId = state.queue[0]
  const currentQuestion = currentQuestionId ? questionsById[currentQuestionId] : null

  const submitAnswer = () => {
    if (state.selectedIndex === null || !currentQuestion || state.completed) {
      return
    }

    const isCorrect = state.selectedIndex === currentQuestion.correctIndex

    setState((prev) => {
      const nextQueue = prev.queue.slice(1)

      if (!isCorrect) {
        nextQueue.push(currentQuestion.id)
      }

      const nextScore = isCorrect ? prev.score + 1 : prev.score
      const isCompleted = nextScore >= TARGET_SCORE

      if (isCorrect) {
        toast.success(`Правильно! +1 бал. (${nextScore}/${TARGET_SCORE})`, { duration: 2500 })
      } else {
        toast.error('Неправильно. Питання повернеться в кінець черги.', { duration: 2500 })
      }

      return {
        ...prev,
        queue: nextQueue,
        score: nextScore,
        selectedIndex: null,
        completed: isCompleted,
      }
    })
  }

  useEffect(() => {
    if (!state.completed) return
    const end = Date.now() + 4000
    const frame = () => {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } })
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  }, [state.completed])

  return (
    <main className="app-shell">
      <div className="card">
        <p className="station-label">Станція {stationNumber}</p>
        <h1>Шкільний квест: HTML та інформатика</h1>

        {!state.completed && currentQuestion && (
          <>
            <div className="stats-row">
              <span>Бали: {state.score} / {TARGET_SCORE}</span>
              <span>У черзі: {state.queue.length}</span>
            </div>

            <div className="question-box">
              <p className="question-text">{currentQuestion.text}</p>
              <div className="answers-grid">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={option}
                    type="button"
                    className={`answer-btn ${state.selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => setState((prev) => ({ ...prev, selectedIndex: index }))}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="primary-btn" onClick={submitAnswer}>
              Підтвердити відповідь
            </button>
          </>
        )}

        {state.completed && (
          <div className="success-fullscreen">
            <p className="success-hint">{successMessage}</p>
          </div>
        )}

      </div>
    </main>
  )
}

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { fontSize: '16px', fontWeight: '700', borderRadius: '12px', padding: '12px 18px' },
          success: { style: { background: '#f1fff6', color: '#176d3f', border: '1px solid #a3e6be' } },
          error: { style: { background: '#fff4f4', color: '#b91c1c', border: '1px solid #fca5a5' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/1" replace />} />
        <Route path="/:stationId" element={<StationQuiz />} />
        <Route path="*" element={<Navigate to="/1" replace />} />
      </Routes>
    </>
  )
}

export default App
