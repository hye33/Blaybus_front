import { useEffect, useMemo, useState } from 'react'
import { QuizzesAPI } from '../api/quizzesApi'
import { toSeoulTime } from '../utils/time'
import '../styles/QuizResultScreen.css'

export default function QuizResultScreen({
  userUuid,
  assetId,
  quizSetId,
  attemptDetail,
  onClose,
  onAiAnalyze,
}) {
  const createdText = attemptDetail?.createdAt
  ? toSeoulTime(attemptDetail.createdAt)
  : ''

  const loading = !attemptDetail

  const details = useMemo(
    () => (Array.isArray(attemptDetail?.details) ? attemptDetail.details : []),
    [attemptDetail]
  )

  const correctCount = attemptDetail?.correctCount ?? 0
  const totalCount = attemptDetail?.totalCount ?? details.length ?? 0

  // const createdText = useMemo(() => {
  //   if (!attemptDetail?.createdAt) return ''
  //   try {
  //     return new Date(attemptDetail.createdAt).toLocaleString()
  //   } catch {
  //     return String(attemptDetail.createdAt)
  //   }
  // }, [attemptDetail])

  const [attempts, setAttempts] = useState([])
  const [attemptsLoading, setAttemptsLoading] = useState(false)
  const [attemptsError, setAttemptsError] = useState('')

  useEffect(() => {
    let alive = true
    if (!assetId || !quizSetId) return

    async function run() {
      setAttemptsLoading(true)
      setAttemptsError('')
      try {
        const data = await QuizzesAPI.listAttempts(assetId, quizSetId)
        if (!alive) return
        setAttempts(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
        if (!alive) return
        setAttempts([])
        setAttemptsError('히스토리를 불러오지 못했어요.')
      } finally {
        if (!alive) return
        setAttemptsLoading(false)
      }
    }

    run()
    return () => { alive = false }
  }, [assetId, quizSetId, userUuid])

  return (
    <section className="qr">
      <div className="qr__frame">
        <header className="qr__header">
          <button className="qr__close" type="button" onClick={onClose} aria-label="닫기">
            <span className="qr__closeIcon" />
        </button>

          <div className="qr__topRow">
            <div className="qr__titleBox">
              <div className="qr__title">퀴즈가 종료되었습니다</div>

              <div className="qr__meta">
                <div className="qr__metaLine">
                  맞은 개수 : {correctCount}개 / {totalCount}개
                </div>
                {createdText && <div className="qr__metaLine">일시 : {createdText}</div>}
              </div>
            </div>

            <button
              className="qr__aiBtn"
              type="button"
              onClick={() => onAiAnalyze?.(attemptDetail?.quizAttemptId)}
              disabled={loading}
              title={loading ? '결과를 불러오는 중이에요' : ''}
            >
              AI 분석하기
            </button>
          </div>

          {loading && <div className="qr__hintLine">결과 불러오는 중…</div>}
        </header>

        <div className="qr__scroll">
          {!loading && details.length === 0 ? (
            <div className="qr__empty">표시할 결과가 없어요.</div>
          ) : (
            <div className="qr__list">
              {details.map((d, i) => {
                const qNo = i + 1
                const isWrong = d.isCorrect === false
                const cardClass = isWrong ? 'is-wrong' : 'is-correct'

                return (
                  <article key={d.quizSetItemId ?? qNo} className={`qr__card ${cardClass}`}>
                    <div className="qr__qTitle">
                      {qNo}. {d.question}
                    </div>

                    <div className="qr__opts">
                      {(Array.isArray(d.options) ? d.options : []).map((opt, oi) => {
                        const isAnswer = d.answer === oi
                        const isUser = d.userChoice === oi

                        // 표시 우선순위: 내 선택(○/×) + 정답(○)
                        let mark = ''
                        if (isUser) mark = d.isCorrect ? '○' : '×'
                        else if (isAnswer) mark = '○'

                        return (
                          <div
                            key={`${qNo}-${oi}`}
                            className={[
                              'qr__optRow',
                              isAnswer ? 'is-answer' : '',
                              isUser ? 'is-user' : '',
                            ].join(' ')}
                          >
                            <span className="qr__mark">{mark}</span>
                            <span className="qr__bullet">{String.fromCharCode(97 + oi)}.</span>
                            <span className="qr__optText">{opt}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="qr__expTitle">해설</div>
                    <div className="qr__expText">{d.explanation || '해설이 없습니다.'}</div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}