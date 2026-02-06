import './App.css'
import { useState } from 'react'
import HomeScreen from './pages/HomeScreen.jsx'
import StudyScreen from './pages/StudyScreen.jsx'
import WorkflowScreen from './pages/WorkflowScreen.jsx'
import QuizScreen from './pages/QuizScreen.jsx'

import Navbar from './components/common/Navbar.jsx'

function App() {
  const [tab, setTab] = useState(0)
  const [selectedModel, setSelectedModel] = useState(null)

  return (
    <>
      <Navbar tab={tab} setTab={setTab} />
      
      <main className="app-layout">
        {tab === 0 && <HomeScreen setSelectedModel={setSelectedModel} setTab={setTab} />}
        {tab === 1 && <StudyScreen selectedModel={selectedModel} />}
        {tab === 2 && <WorkflowScreen />}
        {tab === 3 && <QuizScreen />}
      </main>
      
    </>
  )
}

export default App
