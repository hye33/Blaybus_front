// 퀴즈 히스토리 보이는 화면(퀴즈명, 나의 성적)

import { useEffect, useMemo, useState } from 'react'
import '../styles/QuizShell.css'

const DEV_MODE = true

// 더미: asset별 quizSet 목록 (GET /api/quizzes/assets/{assetId})
function mockQuizSetsForAsset(assetId) {
  if (String(assetId) === '1') return [{ quizSetId: 1 }, { quizSetId: 2 }, { quizSetId: 5 }]
  return [{ quizSetId: 1 }, { quizSetId: 3 }]
}

// 더미: 성적 조회 (GET /api/quizzes/assets/{assetId}/quiz-set/{quizSetId})
function mockHistoryDetail(assetId, quizSetId) {
  const total = 4
  const correct = (Number(quizSetId) % 4) + 1
  return {
    title: `Test${quizSetId} (${correct}/${total})`,
    dateText: '2026 02/05 10:30pm',
    aiSummary: 'ai 총평:\n- 틀린 개념 1개 복습 추천\n- 선택지 비교 근거 강화',
  }
}

export default function QuizHistoryScreen({
  userUuid,
  assetId,
  quizSetId, // 현재 보고 있는 퀴즈(좌측 표시용)
  onBack,
  onRetryQuiz, // (quizSetId) => 다시 풀기(Play로)
}) {
  // 우측: 목록
  const [quizSets, setQuizSets] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  // 우측: 아코디언 열린 항목
  const [openQuizSetId, setOpenQuizSetId] = useState(null)

  // 우측: 열린 항목의 디테일(성적/ai총평)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailById, setDetailById] = useState({}) // { [quizSetId]: {title,dateText,aiSummary} }

  // 좌측 표시용 텍스트(지금은 더미)
  const leftTitle = useMemo(() => '퀴즈명', [])
  const leftDesc = useMemo(() => {
    return `[배운 내용입니다]에 대한 퀴즈입니다.\n총 N문제로 출제되며, 예상 소요 시간은 NN분입니다.`
  }, [])
  const leftMsg = useMemo(() => {
    return `반복은 완벽을 만듭니다.\n이전에 풀었던 퀴즈로 개념을 더 단단하게 다져보세요!`
  }, [])

  useEffect(() => {
    let alive = true
    setListLoading(true)
    setListError('')

    async function run() {
      try {
        if (DEV_MODE) {
          const data = mockQuizSetsForAsset(assetId)
          if (!alive) return
          setQuizSets(data)
          return
        }

        const res = await fetch(`/api/quizzes/assets/${assetId}`, {
          headers: { ...(userUuid ? { 'X-USER-UUID': userUuid } : {}) },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
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

    run()
    return () => { alive = false }
  }, [assetId, userUuid])

  // 아코디언 열릴 때 디테일 로딩(한 번 로딩한 건 캐시)
  const ensureDetail = async (targetId) => {
    if (detailById[targetId]) return
    setDetailLoading(true)

    try {
      let detail
      if (DEV_MODE) {
        detail = mockHistoryDetail(assetId, targetId)
      } else {
        const res = await fetch(`/api/quizzes/assets/${assetId}/quiz-set/${targetId}`, {
          headers: { ...(userUuid ? { 'X-USER-UUID': userUuid } : {}) },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        detail = await res.json()
      }

      setDetailById((prev) => ({ ...prev, [targetId]: detail }))
    } catch (e) {
      console.error(e)
      setDetailById((prev) => ({
        ...prev,
        [targetId]: { title: `Test${targetId}`, dateText: '', aiSummary: '불러오기 실패' },
      }))
    } finally {
      setDetailLoading(false)
    }
  }

  const toggleOpen = async (id) => {
    // 이미 열려 있으면 닫기
    if (openQuizSetId === id) {
        setOpenQuizSetId(null)
        return
    }
    
    setOpenQuizSetId(id)
    await ensureDetail(id)
    }

  return (
    <section className="qz">
      <div className="qz__frame">
        {/* LEFT (Asset이랑 동일 구조) */}
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

        {/* RIGHT (아코디언) */}
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
                const detail = detailById[id]
                const title = detail?.title ?? `Test${id}`
                const dateText = detail?.dateText ?? ''

                return (
                  <div key={id} className={`qz__accItem ${isOpen ? 'is-open' : ''}`}>
                    <button
                      className="qz__rightItem qz__accBtn"
                      type="button"
                      onClick={() => toggleOpen(id)}
                    >
                      <div>
                        <div className="qz__rightItemTitle">{title}</div> {/*Test{quizSetId}*/}
                        {dateText && <div className="qz__accSub">{dateText}</div>}
                      </div>

                      <span className="qz__chev qz__accChev">{isOpen ? '˄' : '›'}</span>
                    </button>

                    {isOpen && (
                      <div className="qz__accPanel">
                        <div className="qz__accLabel">ai 총평:</div>
                        <div className="qz__accText">
                          {detailLoading && !detail ? '불러오는 중…' : (detail?.aiSummary ?? '—')}
                        </div>

                        {/* 선택: 여기서 “이 퀴즈 다시 풀기” 버튼을 우측에 넣고 싶으면 */}
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