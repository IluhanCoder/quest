import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { QUESTIONS_BY_STATION } from './data/questions'
import { RESULTS_BY_STATION } from './data/results'

const TARGET_SCORE = 12

function createInitialState(stationQuestions) {
  return {
    queue: stationQuestions.map((question) => question.id),
    score: 0,
    selectedIndex: null,
    feedback: '',
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

      return {
        ...prev,
        queue: nextQueue,
        score: nextScore,
        selectedIndex: null,
        feedback: isCorrect
          ? 'Правильно! +1 бал.'
          : 'Неправильно. Це питання повернеться в кінець черги.',
        completed: isCompleted,
      }
    })
  }

  const restart = () => {
    setState(createInitialState(stationQuestions))
  }

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

            {state.feedback && <p className="feedback">{state.feedback}</p>}
          </>
        )}

        {state.completed && (
          <div className="success-box">
            <h2>Вітаємо! Ви набрали 12 балів.</h2>
            <p>{successMessage}</p>
            <button type="button" className="primary-btn" onClick={restart}>
              Почати заново
            </button>
          </div>
        )}

      </div>
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/1" replace />} />
      <Route path="/:stationId" element={<StationQuiz />} />
      <Route path="*" element={<Navigate to="/1" replace />} />
    </Routes>
  )
}

export default App
