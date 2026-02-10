// src/api/quizzesApi.js
import { apiFetch } from './apiClient'

export const QuizzesAPI = {
// 새로운 퀴즈 생성 요청
  createQuizSet(assetId, userUuid) {
    return apiFetch(`/api/quizzes/asset/${assetId}/create`, {
      method: 'POST',
      headers: userUuid ? { 'X-USER-UUID': userUuid } : undefined,
    })
  },

// 풀었던 퀴즈 다시 풀기 
  retryQuizSet(quizSetId, userUuid) {
    return apiFetch(`/api/quizzes/quiz-set/${quizSetId}`, {
      method: 'POST',
      headers: userUuid ? { 'X-USER-UUID': userUuid } : undefined,
    })
  },

// 퀴즈 결과 제출
  submitAttempt(quizSetId, payload, userUuid) {
    return apiFetch(`/api/quizzes/quiz-set/${quizSetId}/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userUuid ? { 'X-USER-UUID': userUuid } : {}),
      },
      body: payload,
    })
  },

// 특정 에셋에 대해 풀었던 퀴즈 목록 조회
  listQuizSetsByAsset(assetId, userUuid) {
    return apiFetch(`/api/quizzes/assets/${assetId}`, {
        headers: {...(userUuid ? { 'X-USER-UUID': userUuid } : {}) },
    })
  },

// 퀴즈에 대한 히스토리(성적) 조회
  listAttempts(assetId, quizSetId, userUuid) {
    return apiFetch(`/api/quizzes/assets/${assetId}/quiz-set/${quizSetId}`, {
      headers: { ...(userUuid ? {'X-USER-UUID': userUuid } : {}) },
    })
  },

// 퀴즈 ai 분석 
  aiAnalyze(quizAttemptId, userUuid) {
    return apiFetch(`/api/quizzes/ai-analysis/${quizAttemptId}`, {
        method: 'POST',
        headers: {
            ...(userUuid ? { 'X-USER-UUID': userUuid } : {}),
        },
    })
  },
}