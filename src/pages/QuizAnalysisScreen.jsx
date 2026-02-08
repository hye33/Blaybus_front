import '../styles/QuizAnalysisScreen.css'

export default function QuizAiScreen({ userUuid, quizAttemptId, onBack, onClose }) {
  return (
    <section className="qa">
      <div className="qa__frame">
        <button className="qa__close" type="button" onClick={onClose} aria-label="닫기">×</button>

        <div className="qa__title">AI 분석</div>
        <div className="qa__meta">attemptId: {quizAttemptId ?? '(없음)'}</div>

        <div className="qa__body">
          AI 분석 결과/요청 UI
        </div>

        <div className="qa__footer">
          <button className="qa__ghost" type="button" onClick={onBack}>결과로 돌아가기</button>
        </div>
      </div>
    </section>
  )
}