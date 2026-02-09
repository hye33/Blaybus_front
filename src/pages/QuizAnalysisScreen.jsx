import { useEffect, useMemo, useState } from 'react'
import { QuizzesAPI } from '../api/quizzesApi'
import '../styles/QuizAnalysisScreen.css'

function parseAiReview(text = '') {
  const sections = { summary: '', wrong: '', guide: '' }
  const pattern =
    /\[(총평|핵심 오답 분석|향후 학습 가이드)\]\s*([\s\S]*?)(?=\n\s*\[(총평|핵심 오답 분석|향후 학습 가이드)\]\s*|$)/g

  let m
  while ((m = pattern.exec(text)) !== null) {
    const title = m[1]
    const body = (m[2] || '').trim()
    if (title === '총평') sections.summary = body
    if (title === '핵심 오답 분석') sections.wrong = body
    if (title === '향후 학습 가이드') sections.guide = body
  }

  if (!sections.summary && !sections.wrong && !sections.guide) {
    sections.summary = text.trim()
  }

  return sections
}

export default function QuizAnalysisScreen({ userUuid, quizAttemptId, onClose }) {
  // console.log('[AI SCREEN PROPS]', { quizAttemptId, userUuid })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true

    async function run() {
      const MIN_MS = 600
      const started = Date.now()

      setLoading(true)
      setError('')
      setData(null)

      try {
        if (!quizAttemptId) throw new Error('NO_ATTEMPT_ID')

        let json

        json = await QuizzesAPI.aiAnalyze(quizAttemptId, userUuid)

        // 최소 로딩 시간 보장
        const elapsed = Date.now() - started
        if (elapsed < MIN_MS) {
          await new Promise((r) => setTimeout(r, MIN_MS - elapsed))
        }

        if (!alive) return
        setData(json)
      } catch (e) {
        console.error(e)

        // 최소 로딩 시간 보장(실패도 동일)
        const elapsed = Date.now() - started
        if (elapsed < MIN_MS) {
          await new Promise((r) => setTimeout(r, MIN_MS - elapsed))
        }

        if (!alive) return

        const msg =
          e.message === 'NO_ATTEMPT_ID' ? '분석할 퀴즈 정보가 없어요.' :
          e.message === 'HTTP_401' ? '인증이 필요해요. (401) X-USER-UUID 확인' :
          e.message === 'HTTP_403' ? '권한이 없어요. (403) X-USER-UUID 확인' :
          e.message === 'HTTP_404' ? '분석 API 경로를 찾지 못했어요. (404)' :
          e.message === 'HTTP_405' ? '요청 방식이 달라요. (405) GET/POST 확인' :
          e.message === 'HTTP_500' ? '서버 오류가 발생했어요. (500)' :
          e.message === 'INVALID_JSON' ? '서버 응답이 JSON이 아니에요.' :
          'AI 분석을 불러오지 못했어요.'

        setError(msg)
      } finally {
        if (!alive) return
        setLoading(false)
      }
    }

    run()
    return () => { alive = false }
  }, [quizAttemptId, userUuid])

  const parsed = useMemo(() => parseAiReview(data?.aiReview || ''), [data])

  return (
    <section className="qa">
      <div className="qa__frame">
        {/* 로딩/에러/성공 모두 같은 위치에 X */}
        <button className="qa__close" type="button" onClick={onClose} aria-label="닫기">
          <span className="qa__closeIcon" />
        </button>

        {loading ? (
          <div className="qa__center">
            <div className="qa__loadingText">퀴즈 결과를 분석중입니다...</div>
          </div>
        ) : error ? (
          <div className="qa__center">
            <div className="qa__loadingText">{error}</div>
          </div>
        ) : (
          <div className="qa__scroll">
            <div className="qa__summaryBox">
              <div className="qa__summaryTitle">[총평]</div>
              <div className="qa__summaryText">{parsed.summary || '총평이 없습니다.'}</div>
            </div>

            <div className="qa__section">
              <div className="qa__sectionTitle">[핵심 오답 분석]</div>
              <div className="qa__sectionBody">{parsed.wrong || '오답 분석이 없습니다.'}</div>
            </div>

            <div className="qa__section">
              <div className="qa__sectionTitle">[향후 학습 가이드]</div>
              <div className="qa__sectionBody">{parsed.guide || '학습 가이드가 없습니다.'}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}