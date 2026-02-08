import './App.css'
import { useState } from 'react'

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

  // quiz
  const [quizView, setQuizView] = useState('list')
  const [selectedAssetId, setSelectedAssetId] = useState(null)
  const [activeQuizSetId, setActiveQuizSetId] = useState(null)
  const [quizResetKey, setQuizResetKey] = useState(0)

  const userUuid = 'TEMP-USER-UUID'

  return (
    <>
      <Navbar
        tab={tab}
        setTab={(next) => {
          setTab(next)
          if (next === 2) backToWorkflowList()
          if (next === 3) setQuizResetKey((k) => k + 1)
        }}
      />
      
      <main className="app-layout">
        {tab === 0 && <HomeScreen setSelectedModel={setSelectedModel} setTab={setTab} />}
        {tab === 1 && <StudyScreen selectedModel={selectedModel} />}
        {tab === 2 && (
          workflowView === 'list'
          ? <WorkflowListScreen onOpenWorkflow={openWorkflow} />
          : (<WorkflowScreen
              workflowId={activeWorkflowId}
              onGoWorkflowList={backToWorkflowList}
              onOpenWorkflow={openWorkflow}
            />)
        )}
        {tab === 3 && 
        <QuizScreen
          key={quizResetKey}
          userUuid={userUuid}

          // quizView={quizView}
          // assetId={selectedAssetId}
          // quizSetId={activeQuizSetId}

          // onOpenQuizAsset={(assetId) => {
          //   setSelectedAssetId(assetId)
          //   setQuizView('quizAsset')
          // }}

          // onStartQuiz={(quizSetId) => {
          //   setActiveQuizSetId(quizSetId)
          //   setQuizView('play')
          // }}

          // onFinishQuiz={(quizSetId) => {
          //   setActiveQuizSetId(quizSetId)
          //   setQuizView('result')
          // }}

          // onBackQuizList={() => {
          //   setQuizView('list')
          //   setSelectedAssetId(null)
          //   setActiveQuizSetId(null)
          // }}
        />}
      </main>
      
    </>
  )
}

export default App