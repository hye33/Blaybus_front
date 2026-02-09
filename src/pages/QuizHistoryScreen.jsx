import { useEffect, useMemo, useState } from 'react'
import { QuizzesAPI } from '../api/quizzesApi'
import '../styles/QuizShell.css'

export default function QuizHistoryScreen({
  userUuid,
  assetId,
  assetName,
  quizSetId, // 현재 선택된 quizSetId
  onBack,
  onRetryQuiz,
}) {
  // 오른쪽: quizSet 목록
  const [quizSets, setQuizSets] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  // 오른쪽: 아코디언 열린 quizSetId
  const [openQuizSetId, setOpenQuizSetId] = useState(null)

  // 오른쪽: 열린 quizSetId의 attempt 배열 캐시
  const [detailLoadingId, setDetailLoadingId] = useState(null)
  const [attemptsByQuizSetId, setAttemptsByQuizSetId] = useState({})
  
  // 왼쪽 표시용
  const QUESTION_COUNT = 4
  const EST_MINUTES = 3

  const leftTitle = useMemo(() => assetName || '배운 내용', [assetName])
  const leftDesc = useMemo(() => {
    return `${assetName}에 대한 퀴즈입니다.\n총 ${QUESTION_COUNT}문제로 출제되며, 예상 소요 시간은 ${EST_MINUTES}분입니다.`
  }, [assetName])
  const leftMsg = useMemo(() => {
    return `반복은 완벽을 만듭니다.\n이전에 풀었던 퀴즈로 개념을 더 단단하게 다져보세요!`
  }, [])

  function stripSummaryLabel(text = '') {
    return text.replace(/^\s*\[총평\]\s*/i, '')
  }

  // quizSet 목록 불러오기
  useEffect(() => {
    let alive = true
    setListLoading(true)
    setListError('')

    async function run() {
      try {
        const data = await QuizzesAPI.listQuizSetsByAsset(assetId, userUuid)
        if (!alive) return
        setQuizSets(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
        if (!alive) return
        setQuizSets([])
        setListError('목록을 불러오지 못했어요.')
      } finally {
        if (!alive) return
        setListLoading(false)
      }
    }

    if (assetId) run()
    return () => { alive = false }
  }, [assetId, userUuid])

  // 아코디언 상세(시도 목록) 로딩 + 캐시
  const ensureAttempts = async (targetQuizSetId) => {
    if (!assetId || !targetQuizSetId) return
    if (attemptsByQuizSetId[targetQuizSetId]) return // 이미 캐시됨

    setDetailLoadingId(targetQuizSetId)
    try {
      const data = await QuizzesAPI.listAttempts(assetId, targetQuizSetId, userUuid)
      setAttemptsByQuizSetId((prev) => ({
        ...prev,
        [targetQuizSetId]: Array.isArray(data) ? data : [],
      }))
    } catch (e) {
      console.error(e)
      setAttemptsByQuizSetId((prev) => ({
        ...prev,
        [targetQuizSetId]: [],
      }))
    } finally {
      setDetailLoadingId(null)
    }
  }

  const toggleOpen = async (id) => {
    if (openQuizSetId === id) {
      setOpenQuizSetId(null)
      return
    }
    setOpenQuizSetId(id)
    await ensureAttempts(id)
  }

  return (
    <section className="qz">
      <div className="qz__frame">
        {/* LEFT */}
        <div className="qz__left">
          <div className="qz__title">{leftTitle}</div>
          <div className="qz__desc">{leftDesc}</div>

          <div className="qz__desc" style={{ marginTop: 36, fontSize: 20, fontWeight: 700, opacity: 0.9 }}>
            {leftMsg}
          </div>

          <div className="qz__bottomBtns">
            <button className="qz__btn" type="button" onClick={onBack}>
              그만두기
            </button>

            <button
              className="qz__btn qz__btnPrimary"
              type="button"
              onClick={() => onRetryQuiz?.(quizSetId)}
              disabled={quizSetId == null}
              title={quizSetId == null ? '퀴즈를 선택해 주세요' : ''}
            >
              시작하기
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <aside className="qz__right">
          <div className="qz__rightHeader">나의 성적</div>

          {listLoading ? (
            <div className="qz__rightEmpty">불러오는 중…</div>
          ) : listError ? (
            <div className="qz__rightEmpty">{listError}</div>
          ) : quizSets.length === 0 ? (
            <div className="qz__rightEmpty">기록이 없어요.</div>
          ) : (
            <div className="qz__rightList">
              {quizSets.map(({ quizSetId: id }) => {
                const isOpen = openQuizSetId === id
                const attempts = attemptsByQuizSetId[id]
                const loadingThis = detailLoadingId === id

                // 상단 타이틀: quizSetId + 최근 기록 한 줄(있으면)
                const latest = Array.isArray(attempts) && attempts.length ? attempts[0] : null
                const title = `QuizSet ${id}`
                const dateText = latest?.formattedDate ?? ''

                return (
                  <div key={id} className={`qz__accItem ${isOpen ? 'is-open' : ''}`}>
                    <button
                      className="qz__rightItem qz__accBtn"
                      type="button"
                      onClick={() => toggleOpen(id)}
                    >
                      <div>
                        <div className="qz__rightItemTitle">{title}</div>
                        {dateText && <div className="qz__accSub">{dateText}</div>}
                      </div>
                      <span className="qz__chev qz__accChev">{isOpen ? '˄' : '›'}</span>
                    </button>

                    {isOpen && (
                      <div className="qz__accPanel">
                        {loadingThis ? (
                          <div className="qz__accText">불러오는 중…</div>
                        ) : !attempts || attempts.length === 0 ? (
                          <div className="qz__accText">시도 기록이 없어요.</div>
                        ) : (
                          <>
                            {attempts.map((a) => (
                              <div key={a.attemptId} style={{ marginBottom: 14 }}>
                                {/* <div className="qz__accLabel">{a.formattedDate}</div> */}
                                <div className="qz__accText">
                                  점수: {a.correctCount}/{a.totalCount}
                                  <br />
                                  틀린 문제: {Array.isArray(a.wrongQuestionNumbers) && a.wrongQuestionNumbers.length
                                    ? a.wrongQuestionNumbers.join(', ')
                                    : '없음'}
                                  <br />
                                  AI 총평: {stripSummaryLabel(a.aiReview ?? '—')}
                                </div>
                              </div>
                            ))}
                          </>
                        )}

                        {/* <button className="qz__accAction" type="button" onClick={() => onRetryQuiz?.(id)}>
                          다시 풀기
                        </button> */}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}