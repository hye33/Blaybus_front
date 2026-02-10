import './App.css'
import { useState } from 'react'

import LandingScreen from './pages/LandingScreen.jsx'
import HomeScreen from './pages/HomeScreen.jsx'
import StudyScreen from './pages/StudyScreen.jsx'
import WorkflowListScreen from './pages/WorkflowListScreen.jsx'
import WorkflowScreen from './pages/WorkflowScreen.jsx'
import QuizScreen from './pages/QuizScreen.jsx'

import Navbar from './components/common/Navbar.jsx'

function App() {
  const [tab, setTab] = useState(0)
  const [selectedModel, setSelectedModel] = useState(null)

  const [workflowView, setWorkflowView] = useState('list')
  const [activeWorkflowId, setActiveWorkflowId] = useState(null)

  const openWorkflow = (id) => {
    setActiveWorkflowId(id)
    setWorkflowView('editor')
  }

  const backToWorkflowList = () => {
    setWorkflowView('list')
    setActiveWorkflowId(null)
  }

  if (tab === 0) {
    return <LandingScreen onStart={() => setTab(1)} />
  }

  return (
    <>
      <Navbar
        tab={tab}
        setTab={(next) => {
          if (next === 3) {
            backToWorkflowList()
          }
          setTab(next)
        }}
        onClickLogo={() => {
          backToWorkflowList()
          setTab(0)
        }}
      />
      
      <main className="app-layout">
        {tab === 1 && <HomeScreen setSelectedModel={setSelectedModel} setTab={setTab} />}
        {tab === 2 && <StudyScreen selectedModel={selectedModel} />}
        {tab === 3 && (
          workflowView === 'list'
          ? <WorkflowListScreen onOpenWorkflow={openWorkflow} />
          : (<WorkflowScreen
              workflowId={activeWorkflowId}
              onGoWorkflowList={backToWorkflowList}
              onOpenWorkflow={openWorkflow}
            />)
        )}
        {tab === 4 && <QuizScreen />}
      </main>
      
    </>
  )
}

export default App