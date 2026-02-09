import { useEffect, useMemo, useState, useRef } from 'react'
import '../styles/WorkflowListScreen.css'
import chevronDown from '../assets/chevron-down.png'
import { WorkflowsAPI } from '../api/workflowsApi'

const normalizeData = (d) => ({
  nodes: (d?.nodes ?? []).map((n) => ({
    ...n,
    positionX: Math.round(Number(n.positionX ?? 0)),
    positionY: Math.round(Number(n.positionY ?? 0)),
  })),
  edges: (d?.edges ?? []).map((e) => ({ ...e })),
})

export default function WorkflowListScreen({ onOpenWorkflow }) {
  const [items, setItems] = useState([])
  const [activeMenuId, setActiveMenuId] = useState(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('워크플로우 명')

  const [renameTarget, setRenameTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  const SORTS = [
    { key: 'updated_desc', label: '최신순' },
    { key: 'updated_asc', label: '오래된 순' },
    { key: 'name_asc', label: '알파벳순' },
  ]
  const [sortKey, setSortKey] = useState('updated_desc')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef(null)

  // 최초 목록 로딩
  useEffect(() => {
    ;(async () => {
      const list = await WorkflowsAPI.list()
      setItems(
        (list ?? []).map((w) => ({
          id: w.workflowId,
          name: w.workflowName,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
          schemaVersion: w.schemaVersion,
        }))
      )
    })()
  }, [])

  // 메뉴 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) setSortOpen(false)
      const insideMenu = event.target.closest('.wfl__menuWrap')
      if (!insideMenu) setActiveMenuId(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sortLabel = useMemo(() => SORTS.find((s) => s.key === sortKey)?.label ?? '최신순', [sortKey])

  const sortedItems = useMemo(() => {
    const arr = [...items]
    const getTime = (v) => {
      const t = new Date(v || 0).getTime()
      return Number.isFinite(t) ? t : 0
    }

    switch (sortKey) {
      case 'updated_asc':
        return arr.sort((a, b) => getTime(a.updatedAt) - getTime(b.updatedAt))
      case 'name_asc':
        return arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'))
      case 'updated_desc':
      default:
        return arr.sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt))
    }
  }, [items, sortKey])

  const onCreate = () => {
    setActiveMenuId(null)
    setSortOpen(false)
    setCreateName('워크플로우 명')
    setCreateOpen(true)
  }

  const confirmCreate = async () => {
    const name = createName.trim()
    if (!name) return

    try {
      const created = await WorkflowsAPI.create(name)

      setItems((prev) => [
        {
          id: created.workflowId,
          name: created.workflowName,
          // API 응답에 시간이 없으면 로컬 시간 사용
          updatedAt: new Date().toISOString(), 
          schemaVersion: created.schemaVersion ?? 1,
        },
        ...prev,
      ])
      setCreateOpen(false)
      onOpenWorkflow?.(created.workflowId)
    } catch (e) {
      console.error(e)
      // alert('워크플로우 생성에 실패했습니다.')
    }
  }

  const openRenameModal = (wf) => {
    setDeleteTarget(null)
    setActiveMenuId(null)
    setSortOpen(false)
    setRenameTarget({ id: wf.id, name: wf.name })
    setRenameValue(wf.name || '')
  }

  const openDeleteModal = (wf) => {
    setRenameTarget(null)
    setActiveMenuId(null)
    setSortOpen(false)
    setDeleteTarget({ id: wf.id, name: wf.name })
  }

  const confirmRename = async () => {
    if (!renameTarget) return
    const newName = renameValue.trim()
    if (!newName) return

    try {
      // 1. 최신 데이터(revision) 확보
      const detail = await WorkflowsAPI.get(renameTarget.id)
      
      console.log('이름 수정 시도:', { 
        id: renameTarget.id, 
        oldName: detail.workflowName, 
        newName, 
        revision: detail.revision 
      })

      // const persistedData = detail.data ?? detail.workflowData ?? detail.workflow?.data

      // 2. 업데이트 요청
      const res = await WorkflowsAPI.rename(renameTarget.id, {
        name: newName,
        // data: normalizeData(detail.data), // 기존 노드/엣지 데이터 유지
        revision: detail.revision, // 필수: 리비전 번호
      })

      // 3. 성공 시 목록 갱신
      const serverTime = res?.updatedAt || new Date().toISOString()
      setItems((prev) =>
        prev.map((wf) =>
          wf.id === renameTarget.id
            ? { ...wf, name: res.workflowName ?? newName, updatedAt: serverTime }
            : wf
        )
      )
      setRenameTarget(null)
    } catch (e) {
      console.error('이름 수정 에러 상세:', e)
      alert(`수정 실패: ${e.message || '서버 오류'}`)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      const detail = await WorkflowsAPI.get(deleteTarget.id)
      const nodes = detail?.data?.nodes ?? []

      for (const n of nodes) {
        const clientNodeId = n.id
        try {
          const files = await WorkflowsAPI.listNodeFiles(deleteTarget.id, clientNodeId)
          for (const f of files ?? []) {
            await WorkflowsAPI.deleteNodeFile(deleteTarget.id, clientNodeId, f.nodeFileId)
          }
        } catch (e) {
          // 파일 정리 실패해도 계속 진행(최대한 지워보기)
        }
      }

      // 마지막에 워크플로우 삭제
      await WorkflowsAPI.remove(deleteTarget.id)
      setItems((prev) => prev.filter((wf) => wf.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      console.error('삭제 에러 상세:', e)
      if (e.status === 404) {
         setItems((prev) => prev.filter((wf) => wf.id !== deleteTarget.id))
         setDeleteTarget(null)
      } else {
         alert(`삭제 실패: ${e.message}`)
      }
    }
  }

  const isModalOpen = createOpen || !!renameTarget || !!deleteTarget

  return (
    <section className="wfl">
      <div className={`wfl__frame ${isModalOpen ? 'is-blurred' : ''}`}>
        <div className="wfl__content">
          <header className="wfl__header">
            <div className="wfl__sort wfl__menuWrap" ref={sortRef}>
              <button
                className="wfl__menuBtn wfl__sortBtn"
                onClick={() => {
                  setActiveMenuId(null)
                  setSortOpen((v) => !v)
                }}
                type="button"
              >
                <span className="wfl__sortLabel">{sortLabel}</span>
                <img src={chevronDown} alt="정렬 화살표" className={`wfl__sortArrow ${sortOpen ? 'is-open' : ''}`} />
              </button>

              {sortOpen && (
                <div className="wfl__menu wfl__sortMenu">
                  {SORTS.map((s) => (
                    <button
                      key={s.key}
                      className={`wfl__sortItem ${s.key === sortKey ? 'is-active' : ''}`}
                      type="button"
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
              <div className="wfl__empty">워크플로우가 없습니다.</div>
            ) : (
              sortedItems.map((wf) => (
                <button key={wf.id} type="button" className="wfl__row" onClick={() => onOpenWorkflow?.(wf.id)}>
                  <div className="wfl__rowMain">
                    <div className="wfl__name">{wf.name}</div>
                  </div>

                  <div className="wfl__menuWrap">
                    <button
                      type="button"
                      className="wfl__menuBtn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSortOpen(false)
                        setActiveMenuId(wf.id === activeMenuId ? null : wf.id)
                      }}
                      aria-label="메뉴"
                    >
                      ⋮
                    </button>

                    {activeMenuId === wf.id && (
                      <div className="wfl__menu">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            openRenameModal(wf)
                          }}
                        >
                          이름 수정
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteModal(wf)
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 이름 수정 모달 */}
      {renameTarget && (
        <div className="wfl__modalOverlay" onMouseDown={() => setRenameTarget(null)}>
          <div className="wfl__modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="wfl__modalHeader">
              <div className="wfl__modalTitle">워크플로우 명 수정</div>
              <button type="button" className="wfl__modalClose" onClick={() => setRenameTarget(null)} aria-label="닫기">
                <span className="wfl__modalCloseIcon" />
              </button>
            </div>

            <div className="wfl__modalBody">
              <div className="wfl__fieldLabel">새 워크플로우 명</div>
              <input className="wfl__input" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus />
            </div>

            <div className="wfl__modalFooter">
              <button type="button" className="wfl__btn wfl__btnPrimary" onClick={confirmRename}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 경고 모달 */}
      {deleteTarget && (
        <div className="wfl__modalOverlay" onMouseDown={() => setDeleteTarget(null)}>
          <div className="wfl__modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="wfl__modalHeader">
              <div className="wfl__modalTitle wfl__modalTitleWarn">
                <span className="wfl__warnIcon">!</span>경고
              </div>
            </div>

            <div className="wfl__modalBody wfl__modalBodyCenter">
              <div className="wfl__confirmText">‘{deleteTarget.name}’ 을 정말로 삭제하시겠습니까?</div>
            </div>

            <div className="wfl__modalFooter wfl__modalFooterSplit">
              <button type="button" className="wfl__btn wfl__btnDanger" onClick={confirmDelete}>
                삭제
              </button>
              <button type="button" className="wfl__btn wfl__btnGhost" onClick={() => setDeleteTarget(null)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 새 워크플로우 생성 모달 */}
      {createOpen && (
        <div className="wfl__modalOverlay" onMouseDown={() => setCreateOpen(false)}>
          <div className="wfl__modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="wfl__modalHeader">
              <div className="wfl__modalTitle">새 워크플로우 생성</div>
              <button type="button" className="wfl__modalClose" onClick={() => setCreateOpen(false)} aria-label="닫기">
                <span className="wfl__modalCloseIcon" />
              </button>
            </div>

            <div className="wfl__modalBody">
              <div className="wfl__fieldLabel">워크플로우 명</div>
              <input className="wfl__input" value={createName} onChange={(e) => setCreateName(e.target.value)} autoFocus />
            </div>

            <div className="wfl__modalFooter">
              <button type="button" className="wfl__btn wfl__btnPrimary" onClick={confirmCreate}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}