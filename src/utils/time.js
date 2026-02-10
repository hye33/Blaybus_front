// 서울 시간으로 맞추기 위해 생성 및 사용!
export function toSeoulTime(dateLike) {
  if (!dateLike) return ''

  try {
    return new Date(dateLike).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(dateLike)
  }
}