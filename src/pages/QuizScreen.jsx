import { useState } from "react";
import QuizListScreen from "./QuizListScreen";
import QuizAssetScreen from "./QuizAssetScreen";
import QuizHistoryScreen from "./QuizHistoryScreen"
import QuizPlayScreen from "./QuizPlayScreen";
import QuizResultScreen from "./QuizResultScreen";

export default function QuizScreen({ userUuid }) {
  // const {
  //   quizView,
  //   assetId,
  //   quizSetId,
  //   userUuid,
  //   onOpenQuizAsset,
  //   onStartQuiz,
  //   onFinishQuiz,
  //   onBackToQuizList,
  // } = props
  const [quizView, setQuizView] = useState('list')
  const [assetId, setAssetId] = useState(null)
  const [quizSetId, setQuizSetId] = useState(null)

  const [currentQuizList, setCurrentQuizList] = useState([])

  if (quizView === 'list') {
    return ( 
      <QuizListScreen
        userUuid={userUuid}
        onOpenQuizAsset={(id) => { //nextAssetId
          setAssetId(id) //nextAssetId
          setQuizView('asset')
        }}
      /> 
    )
  }

  if (quizView === 'asset') {
    return (
      <QuizAssetScreen
        userUuid={userUuid}
        assetId={assetId}
        onBack={() => {
          setQuizView('list')
          setAssetId(null)
        }}
        onStartQuiz={(nextQuizSetId, quizList) => {
          setQuizSetId(nextQuizSetId)
          setCurrentQuizList(quizList || [])
          setQuizView('play')
        }}
        onOpenHistory={(clickedQuizSetId) => {
          setQuizSetId(clickedQuizSetId)
          setCurrentQuizList([])
          setQuizView('history')
        }}
      />
    )
  }

  if (quizView === 'history') {
  return (
    <QuizHistoryScreen
      userUuid={userUuid}
      assetId={assetId}
      quizSetId={quizSetId}
      onBack={() => setQuizView('asset')}
      onRetryQuiz={(id) => {
        setQuizSetId(id)
        setCurrentQuizList([]) // 히스토리에서 다시풀기는 GET으로 불러올 수도 있음
        setQuizView('play')
      }}
    />
  )
}

  if (quizView === 'play') {
    return (
      <QuizPlayScreen
        userUuid={userUuid}
        assetId={assetId}
        quizSetId={quizSetId}
        quizList={currentQuizList}
        onBack={() => setQuizView('asset')}
        // onFinish={onFinishQuiz}
      />
    )
  }

  // if (quizView === 'result') { return <QuizResultScreen quizSetId={quizSetId} onBack={onBackToQuizList} /> }

  return null
}