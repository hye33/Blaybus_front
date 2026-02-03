import './App.css'
import { useState } from 'react'
import HomeScreen from './pages/HomeScreen.jsx'
import StudyScreen from './pages/StudyScreen.jsx'
import WorkflowScreen from './pages/WorkflowScreen.jsx'
import QuizScreen from './pages/QuizScreen.jsx'

function App() {
  const [tab, setTab] = useState(0)

  return (
    <>
      <nav className="nav">
        <button onClick={() => setTab(0)}>Home</button>
        <button onClick={() => setTab(1)}>Study</button>
        <button onClick={() => setTab(2)}>Workflow</button>
        <button onClick={() => setTab(3)}>Quiz</button>
      </nav>

      {tab === 0 && <HomeScreen />}
      {tab === 1 && <StudyScreen />}
      {tab === 2 && <WorkflowScreen />}
      {tab === 3 && <QuizScreen />}
    </>
  )
}

export default App
