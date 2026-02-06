import { useEffect, useMemo, useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import '../styles/WorkflowListScreen.css'
import { update } from 'three/examples/jsm/libs/tween.module.js'

const LIST_KEY = 'workflows:index'

// 임시: 샘플 데이터(나중에 서버 붙이면 대체)
function loadIndex() {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveIndex(list) {
  localStorage.setItem(LIST_KEY, JSON.stringify(list))
}

export default function WorkflowListScreen({ onOpenWorkflow }) {
  const [items, setItems] = useState(() => loadIndex())
  const [activeMenuId, setActiveMenuId] = useState(null);
//   const menuRef = useRef(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('워크플로우 명');
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const SORTS = [
    { key: 'updated_desc', label: '최신순' },
    { key: 'updated_asc', label: '오래된 순' },
    { key: 'name_asc', label: '알파벳순' },
    { key: 'recent_used', label: '최근 사용일' },
  ]
  const [sortKey, setSortKey] = useState('updated_desc')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)
  const [notice, setNotice] = useState(null)

  // 새 워크플로우 만들기
  const onCreate = () => {
    setActiveMenuId(null)
    setSortOpen(false)

    setCreateName('워크플로우 명')
    setCreateOpen(true)
  }

  const confirmCreate = () => {
    const name = createName.trim()
    if (!name) return

    const id = `wf-${Date.now()}`
    const now = new Date().toISOString()

    const next = [
      {
        id,
        name,
        updatedAt: now,
        lastOpenedAt: now,
        //thumbnailDataUrl: '' // 나중에 캡처 붙일 자리
        },
        ...items,
    ]
    setItems(next)
    saveIndex(next)
    setCreateOpen(false)
    onOpenWorkflow(id)
  }

  const onRename = (id) => {
    const newName = prompt('새 워크플로우 이름을 입력하세요:')
    if (!newName) return

    const next = items.map((wf) =>
      wf.id === id
        ? { ...wf, name: newName, updatedAt: new Date().toISOString() }
        : wf
    )
    setItems(next)
    saveIndex(next)
  }

  const onDelete = (id) => {
    const ok = window.confirm('정말 이 워크플로우를 삭제하시겠습니까?')
    if (!ok) return

    const next = items.filter((wf) => wf.id !== id)
    setItems(next)
    saveIndex(next)
  }

//   메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (sortRef.current && !sortRef.current.contains(event.target)) setSortOpen(false)
        
        const insideCardMenu = event.target.closest('.wfl__menuWrap')
        if (!insideCardMenu) setActiveMenuId(null) // 메뉴 내부 클릭은 무시
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])

//   파일 정렬
  const sortLabel = useMemo(() => {
    return SORTS.find((s) => s.key === sortKey)?.label ?? '최신순'
  }, [sortKey])

  const sortedItems = useMemo(() => {
    const arr = [...items]

    const getTime = (v) => {
        const t = new Date(v || 0).getTime();
        return Number.isFinite(t) ? t : 0
    }

    switch (sortKey) {
      case 'updated_asc':
        return arr.sort((a, b) => getTime(a.updatedAt) - getTime(b.updatedAt))
      case 'name_asc':
        return arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'))
      case 'recent_used':
        return arr.sort((a, b) => getTime(b.lastOpenedAt || b.updatedAt) - getTime(a.lastOpenedAt || a.updatedAt))
      case 'updated_desc':
      default:
        return arr.sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt))
    }
}, [items, sortKey])

// 이름 변경 모달 열기
  const openRenameModal = (wf) => {
    setDeleteTarget(null); // 한번에 모달 한 개
    setActiveMenuId(null); // 메뉴 닫기
    setSortOpen(false); // 정렬 메뉴 닫기
    setRenameTarget({ id: wf.id, name: wf.name });
    setRenameValue(wf.name || '');
  };

  const openDeleteModal = (wf) => {
    setRenameTarget(null);
    setActiveMenuId(null);
    setSortOpen(false);
    setDeleteTarget({ id: wf.id, name: wf.name });
  }

  const confirmRename = () => {
    if (!renameTarget) return;
    const newName = renameValue.trim();
    if (newName === '') return;

    const next = items.map((wf) =>
        wf.id === renameTarget.id
            ? { ...wf, name: newName, updatedAt: new Date().toISOString() }
            : wf
    );
    setItems(next);
    saveIndex(next);
    setRenameTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    const next = items.filter((wf) => wf.id !== deleteTarget.id);
    setItems(next);
    saveIndex(next);
    setDeleteTarget(null);
    };

  return (
    <section className="wfl">
        <div className="wfl__frame">
            <header className="wfl__header">
                <div className='wfl__sort wfl__menuWrap' ref={sortRef}>
                    <button
                        className="wfl__menuBtn wfl__sortBtn"
                        onClick={() => {
                            setActiveMenuId(null)
                            setSortOpen((v) => !v)
                        }}
                        type='button'
                    >
                        <span className='wfl__sortLabel'>{sortLabel}</span>
                        <svg
                            className={`wfl__sortArrow ${sortOpen ? 'is-open' : ''}`}
                            width="12"
                            height="6"
                            viewBox='0 0 12 6'
                            fill='none'
                            xmlns='https://www.w3.org/2000/svg'
                        >
                                <path
                                    d="M1 1 L6 5 L11 1"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                        </svg>
                    </button>

                    {sortOpen && (
                        <div className="wfl__menu wfl__sortMenu">
                            {SORTS.map((s) => (
                                <button
                                    key={s.key}
                                    className={`wfl__sortItem ${s.key === sortKey ? 'is-active' : ''}`}
                                    type='button'
                                    onClick={() => {
                                        setActiveMenuId(null)
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
                
                <button className="wfl__create" onClick={onCreate}>
                    새 워크플로우 추가
                </button>
            </header>

            <div className="wfl__grid">
                {items.length === 0 ? (
                <div className="wfl__empty">
                    워크플로우가 없습니다.
                </div>
                ) : (
                sortedItems.map((wf) => (
                    <button
                    key={wf.id}
                    className="wfl__card"
                    onClick={() => {
                        const now = new Date().toISOString();
                        const next = items.map((item) =>
                            item.id === wf.id ? {...item, lastOpenedAt: now} : item
                        )
                        setItems(next)
                        saveIndex(next)
                        onOpenWorkflow(wf.id)
                    }}
                    >
                    <div className="wfl__thumb">
                        {wf.thumbnailDataUrl ? (
                        <img src={wf.thumbnailDataUrl} alt="" />
                        ) : (
                        <div className="wfl__thumbPlaceholder">No Preview</div>
                        )}
                    </div>
                    <div className="wfl__meta">
                        <div className="wfl__name">{wf.name}</div>

                        <div className="wfl__menuWrap">
                            <button
                                className="wfl__menuBtn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSortOpen(false);
                                    setActiveMenuId(wf.id === activeMenuId ? null : wf.id)
                                }}
                                > ⋮
                            </button>

                            {activeMenuId === wf.id && (
                                <div className="wfl__menu">
                                    <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // onRename(wf.id);
                                        // setActiveMenuId(null)
                                        openRenameModal(wf);
                                    }}
                                    >이름 수정
                                    </button>
                                    <button
                                    className='danger'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // onDelete(wf.id);
                                        // setActiveMenuId(null)
                                        openDeleteModal(wf);
                                    }}
                                    >삭제
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* 현재 날짜 저장 */}
                        {/* <div className="wfl__date">
                            {new Date(wf.updatedAt).toLocaleDateString()}
                        </div> */}
                    </div>
                    </button>
                ))
                )}
            </div>
        </div>
        {/* 이름 수정 모달 */}
    {renameTarget && (
    <div
        className="wfl__modalOverlay"
        onMouseDown={() => setRenameTarget(null)}
    >
        <div
        className="wfl__modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        >
        <div className="wfl__modalHeader">
            <div className="wfl__modalTitle">워크플로우 명 수정</div>
            <button
            type="button"
            className="wfl__modalClose"
            onClick={() => setRenameTarget(null)}
            aria-label="닫기"
            >
            ×
            </button>
        </div>

        <div className="wfl__modalBody">
            <div className="wfl__fieldLabel">새 워크플로우 명</div>
            <input
            className="wfl__input"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
            />
        </div>

        <div className="wfl__modalFooter">
            <button
            type="button"
            className="wfl__btn wfl__btnPrimary"
            onClick={confirmRename}
            >
            확인
            </button>
        </div>
        </div>
    </div>
    )}

    {/* 삭제 경고 모달 */}
    {deleteTarget && (
    <div
        className="wfl__modalOverlay"
        onMouseDown={() => setDeleteTarget(null)}
    >
        <div
        className="wfl__modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        >
        <div className="wfl__modalHeader">
            <div className="wfl__modalTitle wfl__modalTitleWarn">
            <span className="wfl__warnIcon">!</span>
            경고
            </div>
            {/* <button
            type="button"
            className="wfl__modalClose"
            onClick={() => setDeleteTarget(null)}
            aria-label="닫기"
            >
            ×
            </button> */}
        </div>

        <div className="wfl__modalBody wfl__modalBodyCenter">
            <div className="wfl__confirmText">
            ‘{deleteTarget.name}’ 을 정말로 삭제하시겠습니까?
            </div>
        </div>

        <div className="wfl__modalFooter wfl__modalFooterSplit">
            <button
            type="button"
            className="wfl__btn wfl__btnDanger"
            onClick={confirmDelete}
            >
            삭제
            </button>
            <button
            type="button"
            className="wfl__btn wfl__btnGhost"
            onClick={() => setDeleteTarget(null)}
            >
            취소
            </button>
        </div>
        </div>
    </div>
    )}

    {/* 새 워크플로우 생성 모달 */}
    {createOpen && (
    <div
        className="wfl__modalOverlay"
        onMouseDown={() => setCreateOpen(false)}
    >
        <div
        className="wfl__modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        >
        <div className="wfl__modalHeader">
            <div className="wfl__modalTitle">새 워크플로우 생성</div>
            <button
            type="button"
            className="wfl__modalClose"
            onClick={() => setCreateOpen(false)}
            aria-label="닫기"
            >
            ×
            </button>
        </div>

        <div className="wfl__modalBody">
            <div className="wfl__fieldLabel">워크플로우 명</div>
            <input
            className="wfl__input"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            autoFocus
            />
        </div>

        <div className="wfl__modalFooter">
            <button
            type="button"
            className="wfl__btn wfl__btnPrimary"
            onClick={confirmCreate}
            >
            확인
            </button>
        </div>
        </div>
    </div>
    )}
    </section>
  )
}