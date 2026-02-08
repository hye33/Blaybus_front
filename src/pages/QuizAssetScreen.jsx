// 새로운 퀴즈 보이는 화면
import { useEffect, useMemo, useState } from 'react'
import '../styles/QuizShell.css'

const DEV_MODE = true

function mockQuizSetsForAsset(assetId) {
  if (String(assetId) === '1') return [{ quizSetId: 1 }, { quizSetId: 2 }, { quizSetId: 5 }]
  return [{ quizSetId: 1 }, { quizSetId: 3 }]
}

// ✅ 더미: POST /api/quizzes/asset/{assetId}/create  (문항 리스트 전체)
function mockCreateQuizList(assetId) {
  const quizSetId = Number(Date.now() % 100000) // 임시로 유니크하게
  return [
    {
      quizSetId,
      assetId: Number(assetId),
      quizSetItemId: 1,
      question: '드론 프로펠러(Impeller)의 역할은?',
      options: ['추력을 만들어 비행을 돕는다', '연료를 분사한다', '엔진을 냉각한다', '브레이크를 제어한다'],
      answer: 0,
      explanation: '프로펠러는 공기를 밀어 추력/양력을 만든다.',
      hint: '회전 → 공기',
    },
    {
      quizSetId,
      assetId: Number(assetId),
      quizSetItemId: 2,
      question: 'V6 엔진에서 V6는 무엇을 의미하는가?',
      options: ['V자 형태로 6기통', '4기통', '8기통', '12기통'],
      answer: 0,
      explanation: 'V자 형태로 배열된 6개의 실린더를 의미한다.',
      hint: '실린더 개수',
    },
  ]
}


export default function QuizAssetScreen({
  userUuid,
  assetId,
  onBack,          // 그만두기
  onStartQuiz,     // (quizSetId, quizList) => void
  onOpenHistory,   // (quizSetId) => history 화면으로
}) {
  const [quizSets, setQuizSets] = useState([]) // [{quizSetId:number}...]
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  
  // const [loadingCreate, setLoadingCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  
  // 에셋별 푼 퀴즈(quizSetId 목록) 조회
  useEffect(() => {
    let alive = true
    setHistoryLoading(true)
    setHistoryError('')

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
        setHistoryError('퀴즈 기록을 불러오지 못했어요.')
      } finally {
        if (!alive) return
        setHistoryLoading(false)
      }
    }

    run()
    return () => { alive = false }
  }, [assetId, userUuid])

  const leftDesc = useMemo(() => {
    return `[배운 내용입니다]에 대한 퀴즈입니다.\n총 N문제로 출제되며, 예상 소요 시간은 NN분입니다.`
  }, [])

  // 새 퀴즈 생성 → (quizSetId, quizList) 넘기기
  const handleCreate = async () => {
    setCreating(true)
    setCreateError('')

    try {
      let quizList = []

      if (DEV_MODE) {
        quizList = mockCreateQuizList(assetId)
      } else {
        const res = await fetch(`/api/quizzes/asset/${assetId}/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userUuid ? { 'X-USER-UUID': userUuid } : {}),
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        quizList = await res.json()
      }

      if (!Array.isArray(quizList) || quizList.length === 0) {
        throw new Error('empty quizList')
      }

      const quizSetId = quizList[0]?.quizSetId
      if (quizSetId == null) throw new Error('missing quizSetId')

      onStartQuiz?.(quizSetId, quizList)
    } catch (e) {
      console.error(e)
      setCreateError('새 퀴즈 생성에 실패했어요.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="qz">
      <div className="qz__frame">
        {/* left */}
        <div className="qz__left">
          <div className="qz__title">새로운 퀴즈</div>
          <div className='qz__desc'>{leftDesc}</div>

          {createError && <div style={{ marginTop: 12, color: '#ff9090' }}>{createError}</div>}

          <div className="qz__bottomBtns">
            <button className="qz__btn" type="button" onClick={onBack}>
              그만두기
            </button>

            <button
              className="qz__btn qz__btnPrimary"
              type="button"
              onClick={handleCreate}
              disabled={creating}
            >
            {creating ? '생성 중…' : '새 퀴즈 생성'}
            </button>
          </div>
        </div>

        {/* right */}
        <aside className='qz__right'>
          <div className='qz__rightHeader'>히스토리</div>

          {historyLoading ? (
            <div className="qz__rightEmpty">불러오는 중...</div>
          ) : historyError ? (
            <div className='qz__rightEmpty'>{historyError}</div>
          ) : quizSets.length === 0 ? (
            <div className="qz__rightEmpty">기록이 없어요.</div>
          ) : (
            <div className="qz__rightList">
              {quizSets.map(({ quizSetId }) => (
                <button
                  key={quizSetId}
                  className='qz__rightItem'
                  type='button'
                  onClick={() => onOpenHistory?.(quizSetId)}
                >
                  <div className='qz__rightItemTitle'>퀴즈명</div>
                  <div className='qz__chev'>›</div>
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}