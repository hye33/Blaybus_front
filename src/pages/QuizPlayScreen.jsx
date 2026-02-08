import { useEffect, useMemo, useState } from 'react'
import '../styles/QuizPlayScreen.css'

const DEV_MODE = true

// 더미(quizList가 비어있을 때 로딩용)
function mockGetQuizSet(quizSetId, assetId) {
  return [
    {
      quizSetId,
      assetId,
      quizSetItemId: 101,
      question: '1. 우리나라의 수도는?',
      options: ['서울', '토론토', '도쿄', '워싱턴'],
      answer: 0,
      explanation: '대한민국의 수도는 서울입니다.',
      hint: 'ㅅㅇ',
    },
    {
      quizSetId,
      assetId,
      quizSetItemId: 102,
      question: '2. 2 + 2 = ?',
      options: ['1', '2', '3', '4'],
      answer: 3,
      explanation: '2+2=4',
      hint: '두 개씩 두 번',
    },
    {
      quizSetId,
      assetId,
      quizSetItemId: 103,
      question: '3. 지구는 몇 번째 행성?',
      options: ['1', '2', '3', '4'],
      answer: 2,
      explanation: '태양계에서 지구는 3번째 행성입니다.',
      hint: '수금지화목토천해',
    },
    {
      quizSetId,
      assetId,
      quizSetItemId: 104,
      question: '4. 바다의 색은?',
      options: ['빨강', '파랑', '보라', '주황'],
      answer: 1,
      explanation: '보통 파랗게 보입니다.',
      hint: 'sky',
    },
  ]
}

export default function QuizPlayScreen({
  userUuid,
  assetId,
  quizSetId,
  quizList,     // create에서 받은 전체 문항 리스트 (있으면 그대로 사용)
  onBack,       // 뒤로(Asset/History로)
  onFinish,     // 제출 성공 후 다음 화면 이동용(선택)
}) {
  // 실제로 사용할 문항 리스트
  const [items, setItems] = useState(() => (Array.isArray(quizList) ? quizList : []))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 현재 인덱스
  const [idx, setIdx] = useState(0)

  // 힌트 열림 여부(현재 문제 기준)
  const [hintOpen, setHintOpen] = useState(false)

  // 답 저장: { [quizSetItemId]: 선택지 index }
  const [selectedByItemId, setSelectedByItemId] = useState({})

  // quizList가 없으면(=히스토리에서 다시풀기 등) quizSetId로 불러오기
  useEffect(() => {
    let alive = true

    async function run() {
      // quizList가 이미 있으면 fetch 불필요
      if (Array.isArray(quizList) && quizList.length > 0) return

      setLoading(true)
      setError('')

      try {
        let data = []
        if (DEV_MODE) {
          data = mockGetQuizSet(quizSetId, Number(assetId))
        } else {
          // 풀었던 퀴즈 다시 불러오기: /api/quizzes/quiz-set/{quizSetId}
          const res = await fetch(`/api/quizzes/quiz-set/${quizSetId}`, {
            headers: { ...(userUuid ? { 'X-USER-UUID': userUuid } : {}) },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          data = await res.json()
        }

        if (!alive) return
        setItems(Array.isArray(data) ? data : [])
        setIdx(0)
        setHintOpen(false)
        setSelectedByItemId({})
      } catch (e) {
        console.error(e)
        if (!alive) return
        setItems([])
        setError('퀴즈를 불러오지 못했어요.')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()
    return () => { alive = false }
  }, [quizSetId, assetId, userUuid, quizList])

  const total = items.length
  const current = items[idx]

  useEffect(() => {
  if (Array.isArray(quizList) && quizList.length > 0) {
    setItems(quizList)
    setIdx(0)
    setHintOpen(false)
    setSelectedByItemId({})
    setError('')
  }
}, [quizList])

  // 현재 문제 바뀌면 힌트는 접기
  useEffect(() => {
    setHintOpen(false)
  }, [idx])

  const currentSelected = useMemo(() => {
    if (!current) return null
    return selectedByItemId[current.quizSetItemId] ?? null
  }, [current, selectedByItemId])

  const canPrev = idx > 0
  const canNext = idx < total - 1

  const choose = (optionIndex) => {
    if (!current) return
    setSelectedByItemId((prev) => ({
      ...prev,
      [current.quizSetItemId]: optionIndex,
    }))
  }

  const goPrev = () => { if (canPrev) setIdx((v) => v - 1) }
  const goNext = () => { if (canNext) setIdx((v) => v + 1) }

  const allAnswered = useMemo(() => {
    if (!items.length) return false
    return items.every((q) => selectedByItemId[q.quizSetItemId] != null)
  }, [items, selectedByItemId])

  const submit = async () => {
    if (!items.length) return

    const payload = {
      answers: items.map((q) => ({
        quizSetItemId: q.quizSetItemId,
        userChoice: selectedByItemId[q.quizSetItemId] ?? null,
      })),
    }

    // if (payload.answers.some(a => a.userChoice == null)) {
    //   alert('아직 선택하지 않은 문제가 있습니다')
    //   return
    // }
    if (payload.answers.some(a => a.userChoice == null)) return

    setLoading(true)
    setError('')

    try {
      let result

      if (DEV_MODE) {
        // 더미 성공 처리
        result = { quizAttemptId: 999, submitted: true }

        result = {
            quizAttemptId: 999,
            quizSetId,
            createdAt: new Date().toISOString(),
            totalCount: items.length,
            correctCount: 0,
            details: items.map((q) => ({
                quizSetItemId: q.quizSetItemId,
                question: q.question,
                explanation: q.explanation,
                hint: q.hint,
                options: q.options,
                answer: q.answer,
                userChoice: selectedByItemId[q.quizSetItemId],
                isCorrect: selectedByItemId[q.quizSetItemId] === q.answer,
            })),
        }
      } else {
        const res = await fetch(`/api/quizzes/quiz-set/${quizSetId}/attempts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(userUuid ? { 'X-USER-UUID': userUuid } : {}),
          },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        result = await res.json()
      }

      // 제출 성공 → 다음 화면으로
      onFinish?.({ quizSetId, assetId, result })
    } catch (e) {
      console.error(e)
      setError('제출에 실패했어요.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && total === 0) {
    return (
      <section className="qp">
        <div className="qp__frame">
          <div className="qp__center">불러오는 중…</div>
        </div>
      </section>
    )
  }

  if (error && total === 0) {
    return (
      <section className="qp">
        <div className="qp__frame">
          <div className="qp__center">
            <div>{error}</div>
            <button className="qp__ghost" type="button" onClick={onBack}>돌아가기</button>
          </div>
        </div>
      </section>
    )
  }

  if (!current) {
    return (
      <section className="qp">
        <div className="qp__frame">
          <div className="qp__center">문제가 없어요.</div>
        </div>
      </section>
    )
  }

  return (
    <section className="qp">
      <div className="qp__frame">
        {/* 진행 바 */}
        <div className="qp__progress">
          {items.map((_, i) => (
            <div
              key={i}
              className={`qp__bar ${i <= idx ? 'is-active' : ''}`}
              aria-label={`${i + 1}번`}
            />
          ))}
        </div>

        <div className="qp__body">
          {/* 왼쪽 화살표 */}
          <button
            className="qp__arrow qp__arrowLeft"
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="이전 문제"
          >
            ‹
          </button>

          {/* 문제/선택지 */}
          <div className="qp__content">
            <div className="qp__qTitle">{current.question}</div>

            <div className="qp__options">
              {current.options.map((opt, i) => {
                const selected = currentSelected === i
                return (
                  <button
                    key={i}
                    type="button"
                    className={`qp__opt ${selected ? 'is-selected' : ''}`}
                    onClick={() => choose(i)}
                  >
                    {String.fromCharCode(97 + i)}. {opt}
                  </button>
                )
              })}
            </div>

            {/* 힌트 보기 */}
            <button
              type="button"
              className="qp__hintBtn"
              onClick={() => setHintOpen((v) => !v)}
            >
              힌트보기
            </button>

            {/* 힌트는 눌렀을 때만 보이도록 */}
            {hintOpen && (
              <div className="qp__hintBox">
                {current.hint || '힌트가 없습니다.'}
              </div>
            )}

            {/* 마지막 문제에서만 제출하기 버튼 뜨도록 */}
            <div className="qp__footer">
              <button className="qp__ghost" type="button" onClick={onBack}>
                그만두기
              </button>

              {idx === total - 1 ? (
                <button
                  className="qp__primary"
                  type="button"
                  onClick={submit}
                  disabled={loading || !allAnswered}
                  title={!allAnswered ? '모든 문제를 선택해 주세요' : ''}
                >
                  {loading ? '제출 중…' : '제출하기'}
                </button>
              ) : (
                <button
                  className="qp__primary"
                  type="button"
                  onClick={goNext}
                  disabled={!canNext}
                >
                  다음 문제
                </button>
              )}
            </div>

            {error && <div className="qp__error">{error}</div>}
          </div>

          {/* 오른쪽 화살표 */}
          <button
            className="qp__arrow qp__arrowRight"
            type="button"
            onClick={goNext}
            disabled={!canNext}
            aria-label="다음 문제"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}