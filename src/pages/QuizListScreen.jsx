import { useEffect, useMemo, useState, useRef } from 'react'
import { apiFetch } from '../api/apiClient'
// import { QuizzesAPI } from '../api/quizzesApi'
import '../styles/QuizListScreen.css'
import chevronDown from '../assets/chevron-down.png'

export default function QuizListScreen({ onOpenQuizAsset }) {
// console.log('[QuizListScreen] render', { DEV_MODE })
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const SORTS = [
    { key: 'updated_desc', label: '최신순' },
    { key: 'updated_asc', label: '오래된 순' },
    { key: 'name_asc', label: '알파벳순' },
    { key: 'recent_used', label: '최근 사용일' },
  ]
  const [sortKey, setSortKey] = useState('updated_desc')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)

// 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (sortRef.current && !sortRef.current.contains(event.target)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

  useEffect(() => {
    console.log('[QuizListScreen] useEffect fired')
    let alive = true

    async function fetchAssets() {
        setLoading(true)
        setErrorMsg('')

        try {
            console.log('[QuizListScreen] calling apiFetch...')
            const data = await apiFetch('/api/assets')
            console.log('[QuizListScreen] got', data)
            if (!alive) return
            setItems(Array.isArray(data) ? data : [])
            } catch (err) {
            if (!alive) return
            setItems([])
            setErrorMsg('퀴즈 목록을 불러오지 못했습니다.')
            console.error(err)
            } finally {
            if (!alive) return
            setLoading(false)
            }
        }

    fetchAssets()
    return () => { alive = false }
    }, [])

// 파일 정렬
  const sortLabel = useMemo(() => {
    return SORTS.find((s) => s.key === sortKey)?.label ?? '최신순'
  }, [sortKey])

  const sortedItems = useMemo(() => {
    const arr = [...items]

    const getTime = (v) => {
        const t = new Date(v || 0).getTime();
        return Number.isFinite(t) ? t : 0
    }
    
    const getName = (x) => (x?.assetName ?? x?.name ?? '').toString()

    switch (sortKey) {
        case 'updated_asc':
            return arr.sort((a, b) => getTime(a.lastAccessedAt) - getTime(b.lastAccessedAt))
        case 'recent_used':
        case 'updated_desc':
        default:
            return arr.sort((a, b) => getTime(b.lastAccessedAt) - getTime(a.lastAccessedAt))
    }
  }, [items, sortKey])

  return (
    <section className="qls">
        <div className={"qls__frame"}>
            <div className='qls__content'>
                <header className="qls__header">
                <div className='qls__sort qls__menuWrap' ref={sortRef}>
                    <button
                        className="qls__menuBtn qls__sortBtn"
                        onClick={() => setSortOpen((v) => !v)}
                        type='button'
                    >
                        <span className='qls__sortLabel'>{sortLabel}</span>
                        <img src={chevronDown} alt="정렬 화살표" className={`qls__sortArrow ${sortOpen ? 'is-open' : ''}`} />
                    </button>

                    {sortOpen && (
                        <div className="qls__menu qls__sortMenu">
                            {SORTS.map((s) => (
                                <button
                                    key={s.key}
                                    className={`qls__sortItem ${s.key === sortKey ? 'is-active' : ''}`}
                                    type='button'
                                    onClick={() => {
                                        // setActiveMenuId(null)
                                        setSortKey(s.key)
                                        setSortOpen(false)
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    className='qls__refresh'
                    type='button'
                    onClick={() => window.location.reload()}
                    title='새로고침'
                    >
                        새로고침
                </button>
            </header>

            <div className="qls__grid">
                {loading? (
                    <div className='qls__empty'>불러오는 중...</div>
                ) : errorMsg? (
                    <div className='qls__empty'>{errorMsg}</div>
                ) : sortedItems.length === 0 ? (
                    <div className='qls__empty'>퀴즈를 풀 수 있는 에셋이 없습니다.</div>
                ) : (
                    sortedItems.map((asset) => {
                        const assetId = asset.assetId ?? asset.id
                        const title = asset.assetName ?? asset.name ?? `asset-${assetId}`

                        const thumb = asset.assetThumbnailUrl

                        return (
                            <button
                                key={assetId}
                                className='qls__card'
                                type='button'
                                onClick={() => onOpenQuizAsset(assetId)}
                                >
                                <div className='qls__thumb'>
                                    {thumb ? (
                                        <img src={thumb} alt='' />
                                    ) : (
                                        <div className='qls__thumbPlaceholder'>No Preview</div>
                                    )}
                                </div>
                                <div className='qls__meta'>
                                    <div className='qls__name'>{title}</div>
                                    {/* {asset.updatedAt && (
                                        <div className='qls__sub'>
                                            {new Date(asset.updatedAt).toLocaleDateString()}
                                        </div>
                                    )} */}
                                </div>
                            </button>
                        )
                    })
                )}
            </div>
        </div>
      </div>
    </section>
  )
}