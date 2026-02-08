import { useEffect, useMemo, useState } from 'react'
import '../styles/QuizAnalysisScreen.css'

const DEV_MODE = true

function mockAiReview(quizAttemptId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        quizAttemptId,
        aiReview:
          "[총평]\n기본 구성요소와 역할에서 혼동이 있네요.\n각 부품의 '무엇을 하는지'를 기능 중심으로 정리하면 빠르게 개선될 수 있어요.\n" +
          "[핵심 오답 분석]\n1) 피스톤(정답 3, 선택 0): 연소에너지→기계적 회전으로 변환하는 역할임을 놓치셨습니다.\n2) 실린더 헤드(정답 1, 선택 2): 밸브·점화플러그 장착과 연소실 밀폐 기능이 핵심입니다.\n3) 터보차저(정답 0, 선택 1): 배기가스로 구동해 흡입공기를 압축, 출력 향상이 목적입니다.\n4) V6 배열(정답 1, 선택 3): 두 개의 3기통 뱅크가 V자 형태로 배열됩니다.\n\n" +
          "[향후 학습 가이드]\n엔진 단면도 보며 각 부품의 역할을 말로 설명해보세요. 터빈·압축기 작동 원리 영상과 V6 구성도 반복 학습하면 도움이 됩니다. 응원해요!",
        createdAt: new Date().toISOString(),
      })
    }, 1200)
  })
}

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

        if (DEV_MODE) {
          json = await mockAiReview(quizAttemptId)
        } else {
          const res = await fetch(`/api/quizzes/ai-analysis/${quizAttemptId}`, {
            method: 'GET',
            headers: { ...(userUuid ? { 'X-USER-UUID': userUuid } : {}) },
          })

          const raw = await res.text()
          console.log('[AI] status:', res.status, 'raw:', raw)

          if (!res.ok) throw new Error(`HTTP_${res.status}`)

          try {
            json = JSON.parse(raw)
          } catch {
            throw new Error('INVALID_JSON')
          }
        }

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