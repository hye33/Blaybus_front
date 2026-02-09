// 새로운 퀴즈 보이는 화면
import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../api/apiClient'
import { QuizzesAPI } from '../api/quizzesApi'
import '../styles/QuizShell.css'

export default function QuizAssetScreen({
  userUuid,
  assetId,
  assetName,
  onBack,          // 그만두기
  onStartQuiz,     // (quizSetId, quizList) => play
  onOpenHistory,   // (quizSetId) => history
}) {
  const [quizSets, setQuizSets] = useState([])
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
      const data = await apiFetch(`/api/quizzes/assets/${assetId}`)
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
}, [assetId])

  const QUESTION_COUNT = 4
  const EST_MINUTES = 3

  const leftTitle = useMemo(() => assetName || '배운 내용', [assetName])
  const leftDesc = useMemo(() => {
    return `${assetName}에 대한 퀴즈입니다.\n총 ${QUESTION_COUNT}문제로 출제되며, 예상 소요 시간은 ${EST_MINUTES}분입니다.`
  }, [assetName])

  // 새 퀴즈 생성 -> (quizSetId, quizList) 넘기기
  const handleCreate = async () => {
    setCreating(true)
    setCreateError('')

    try {
      let quizList = []

      quizList = await QuizzesAPI.createQuizSet(assetId)

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