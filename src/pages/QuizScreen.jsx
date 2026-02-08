import { useState } from "react";
import QuizListScreen from "./QuizListScreen";
import QuizAssetScreen from "./QuizAssetScreen";
import QuizHistoryScreen from "./QuizHistoryScreen";
import QuizPlayScreen from "./QuizPlayScreen";
import QuizResultScreen from "./QuizResultScreen";
import QuizAnalysisScreen from "./QuizAnalysisScreen";

export default function QuizScreen({ userUuid }) {
  const [quizView, setQuizView] = useState('list');
  const [assetId, setAssetId] = useState(null);
  const [quizSetId, setQuizSetId] = useState(null);

  const [currentQuizList, setCurrentQuizList] = useState([]);

  const [latestAttemptDetail, setLatestAttemptDetail] = useState(null);
  const [quizAttemptIdForAi, setQuizAttemptIdForAi] = useState(null)

  const resetAttempt = () => setLatestAttemptDetail(null);

  if (quizView === 'list') {
    return (
      <QuizListScreen
        userUuid={userUuid}
        onOpenQuizAsset={(id) => {
          setAssetId(id);
          setQuizSetId(null);
          setCurrentQuizList([]);
          resetAttempt();
          setQuizView('asset');
        }}
      />
    );
  }

  if (quizView === 'asset') {
    return (
      <QuizAssetScreen
        userUuid={userUuid}
        assetId={assetId}
        onBack={() => {
          setQuizView('list');
          setAssetId(null);
          setQuizSetId(null);
          setCurrentQuizList([]);
          resetAttempt();
        }}
        onStartQuiz={(nextQuizSetId, quizList) => {
          setQuizSetId(nextQuizSetId);
          setCurrentQuizList(quizList || []);
          resetAttempt();
          setQuizView('play');
        }}
        onOpenHistory={(clickedQuizSetId) => {
          setQuizSetId(clickedQuizSetId);
          setCurrentQuizList([]);
          // history에서는 result로 안 가니까 attempt는 굳이 유지/초기화 어느 쪽도 상관 없는데
          // 깔끔하게 초기화만 해두자
          resetAttempt();
          setQuizView('history');
        }}
      />
    );
  }

  if (quizView === 'history') {
    return (
      <QuizHistoryScreen
        userUuid={userUuid}
        assetId={assetId}
        quizSetId={quizSetId}
        onBack={() => setQuizView('asset')}
        onRetryQuiz={(id) => {
          setQuizSetId(id);
          setCurrentQuizList([]); // 히스토리에서 다시풀기: QuizPlayScreen에서 GET으로 불러오게
          resetAttempt();
          setQuizView('play');
        }}
      />
    );
  }

  if (quizView === 'play') {
    return (
      <QuizPlayScreen
        userUuid={userUuid}
        assetId={assetId}
        quizSetId={quizSetId}
        quizList={currentQuizList}
        onBack={() => setQuizView('asset')}
        onFinish={({ result }) => {
          // submit 응답(details 포함) 저장 후 result로 이동
          setLatestAttemptDetail(result || null);
          setQuizView('result');
        }}
      />
    );
  }

  if (quizView === 'result') {
    return (
      <QuizResultScreen
        userUuid={userUuid}
        assetId={assetId}
        quizSetId={quizSetId}
        attemptDetail={latestAttemptDetail}
        onClose={() => setQuizView('asset')}
        onAiAnalyze={({ quizAttemptId }) => {
          setQuizAttemptIdForAi(quizAttemptId ?? null)
          setQuizView('ai')
        }}
      />
    );
  }

  if (quizView === 'ai') {
    return (
      <QuizAnalysisScreen
        userUuid={userUuid}
        quizAttemptId={quizAttemptIdForAi}
        onBack={() => setQuizView('result')}
        onClose={() => setQuizView('asset')}
      />
    );
  }

  return null;
}