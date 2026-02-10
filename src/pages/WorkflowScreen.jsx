import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react'
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  Controls,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '../styles/WorkflowScreen.css'
import folderPlus from '../assets/folder-plus.png'
import workflowIcon from '../assets/button_projSelect.png'
import { WorkflowsAPI } from '../api/workflowsApi'
import { fromServerToReactFlow, fromReactFlowToServer } from '../workflowMapping'
import ToastOverlay from '../components/common/ToastOverlay'

function normalizeData(d) {
  return {
    nodes: (d?.nodes ?? []).map((n) => ({
      ...n,
      positionX: Math.round(Number(n.positionX ?? 0)),
      positionY: Math.round(Number(n.positionY ?? 0)),
    })),
    edges: (d?.edges ?? []).map((e) => ({ ...e })),
  }
}

function safeId(prefix) {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

export default function WorkflowScreen({ workflowId, onOpenWorkflow }) {
  const wid = useMemo(() => Number(workflowId), [workflowId])
  
  const [wfMenuOpen, setWfMenuOpen] = useState(false)
  const wfMenuRef = useRef(null)

  const [workflowList, setWorkflowList] = useState([])
  const [wfName, setWfName] = useState('워크플로우')
  const [revision, setRevision] = useState(null)

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])

  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [nodeFiles, setNodeFiles] = useState(null)

  // 로딩 직후 저장 방지용
  const skipNextSaveRef = useRef(false)
  const savingRef = useRef(false)
  const pendingSaveRef = useRef(false)
  const lastSavedSigRef = useRef('')
  const uploadingRef = useRef(false)
  const revisionRef = useRef(null)

  const composingCountRef = useRef(0)
  const setComposing = useCallback((isComposing) => {
    composingCountRef.current += isComposing ? 1 : -1
    if(composingCountRef.current < 0) composingCountRef.current = 0
  }, [])

  const [toast, setToast] = useState({ open: false, message: '' })
  const toastTimerRef = useRef(null)
  const showToast = useCallback((message) => {
  // 이미 떠있는 토스트가 있으면 타이머 리셋
  setToast({ open: true, message })

  if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  toastTimerRef.current = setTimeout(() => {
    setToast((t) => ({ ...t, open: false }))
    toastTimerRef.current = null
  }, 1600)
}, [])

  useEffect(() => {
    revisionRef.current = revision
  }, [revision])

  // 메뉴 바깥 클릭 닫기
  useEffect(() => {
    const onDown = (e) => {
      if (wfMenuRef.current && !wfMenuRef.current.contains(e.target)) setWfMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // 목록 로딩(메뉴용)
  useEffect(() => {
    ;(async () => {
      const list = await WorkflowsAPI.list()
      setWorkflowList(
        (list ?? []).map((w) => ({
          id: w.workflowId,
          name: w.workflowName,
        }))
      )
    })()
  }, [])

  // 워크플로우 상세 로딩 + 파일 정보 조회
  useEffect(() => {
    ;(async () => {
      try {
        const detail = await WorkflowsAPI.get(wid)
        setWfName(detail.workflowName ?? '워크플로우')
        setRevision(detail.revision)

        // 1. 기본 노드 데이터 매핑
        const { nodes: rfNodes, edges: rfEdges } = fromServerToReactFlow(detail.data)

        // 2. 각 노드별로 첨부된 파일이 있는지 확인하여 데이터 병합
        const nodesWithFiles = await Promise.all(
          rfNodes.map(async (node) => {
            try {
              // API를 통해 해당 노드의 파일 목록 조회
              const files = await WorkflowsAPI.listNodeFiles(wid, node.id)
              // 파일이 있다면 첫 번째 파일을 노드 정보에 심어줌
              if (files && files.length > 0) {
                // 최신 파일 하나만 보여준다고 가정 (여러 개면 로직 조정 필요)
                const lastFile = files[files.length - 1] 
                return {
                  ...node,
                  data: {
                    ...node.data,
                    fileName: lastFile.nodeFileName,
                    fileId: lastFile.nodeFileId,
                  },
                }
              }
            } catch (e) {
              // 파일 조회 실패해도 노드는 보여야 하므로 무시
            }
            return node
          })
        )

        skipNextSaveRef.current = true
        setNodes(nodesWithFiles)
        setEdges(rfEdges)
      } catch (e) {
        console.error(e)
        showToast('워크플로우 로딩 실패')
      }
    })()
  }, [wid, showToast])

  const connectionLineStyle = useMemo(
    () => ({ stroke: 'var(--pink-main)', strokeWidth: 2 }),
    []
  )

  const defaultEdgeOptions = useMemo(
    () => ({ type: 'smoothstep', style: { stroke: 'var(--pink-main)', strokeWidth: 2 } }),
    []
  )

  const onNodesChange = useCallback((changes) => {
      setNodes((snap) => applyNodeChanges(changes, snap))
  }, [])

  const onEdgesChange = useCallback(
    (changes) => setEdges((snap) => applyEdgeChanges(changes, snap)),
    []
  )

  const onConnect = useCallback(
    (params) => {
      const id = safeId('edge')
      setEdges((snap) => addEdge({ ...params, id, type: 'smoothstep' }, snap))
    },
    []
  )

  const addNewNode = useCallback(() => {
    const newId = safeId('node')
    setNodes((ns) => {
      const maxY = ns.reduce((m, n) => Math.max(m, n.position?.y ?? 0), 0)
      return [
        ...ns,
        {
          id: newId,
          type: 'textUpdater',
          position: { x: 80, y: maxY + 220 },
          data: { title: '소제목', body: '내용 입력하는 부분', fileName: '' },
        },
      ]
    })
  }, [])

  // 노드 텍스트 변경
  const onChangeNodeField = useCallback((id, patch) => {
    setNodes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    )
  }, [])

  const saveWorkflow = useCallback(async () => {
    const currentRevision = revisionRef.current
    if (currentRevision == null) return

    // if (revision == null) return
    const raw = fromReactFlowToServer(nodes, edges)
    const data = normalizeData(raw)

    const sig = JSON.stringify({ name:wfName, data })
    if (sig === lastSavedSigRef.current) return

    if (savingRef.current) {
      pendingSaveRef.current = true
      return
    }

    savingRef.current = true
    try {
      const res = await WorkflowsAPI.update(wid, { name: wfName, data, revision: Number(currentRevision),
      })
      
      revisionRef.current = res.revision
      setRevision(res.revision)
      lastSavedSigRef.current = sig
      skipNextSaveRef.current = true
    } catch (e) {
  if (e?.status === 409) {
    try {
      const latest = await WorkflowsAPI.get(wid)
      revisionRef.current = latest.revision
      setRevision(latest.revision)

      // 최신 revision으로 한 번만 재시도
      const res2 = await WorkflowsAPI.update(wid, {
        name: wfName,
        data,
        revision: latest.revision,
      })
      revisionRef.current = res2.revision
      setRevision(res2.revision)
      lastSavedSigRef.current = sig
      skipNextSaveRef.current = true
      showToast('충돌을 해결하고 저장했어요.')
      return
    } catch (e2) {
      showToast('저장 충돌이 계속 발생해요. 새로고침 후 다시 시도해 주세요.')
      return
    }
  }

  showToast('저장에 실패했어요. 다시 시도해 주세요.')
  } finally {
    savingRef.current = false
    if (pendingSaveRef.current) {
      pendingSaveRef.current = false
      setTimeout(() => saveWorkflow(), 0)
    }
  }
}, [wid, wfName, nodes, edges, showToast])

  const flushSave = useCallback(async () => {
    await saveWorkflow()
  }, [saveWorkflow])

  // 노드 파일 업로드 (multipart -> S3 -> URL 저장)
  const onUploadFileForNode = useCallback(
  async (nodeId, file) => {
    if (!file) return

    showToast('업로드 시도 중...')
    uploadingRef.current = true

    try {
      await flushSave()
      await WorkflowsAPI.uploadNodeFile(wid, nodeId, file)

      onChangeNodeField(nodeId, { fileName: file.name })
      showToast('업로드 완료!')

      if (selectedNodeId === nodeId) {
        const files = await WorkflowsAPI.listNodeFiles(wid, nodeId)
        setNodeFiles(files ?? [])
      }
    } catch (e) {
      if (e?.status === 409) {
        showToast('저장 충돌이 발생했어요. 다시 시도해 주세요.')
        return
      }
      showToast('파일 업로드에 실패했어요. 다시 시도해 주세요.')
    } finally {
      uploadingRef.current = false
    }
  },
  [wid, flushSave, selectedNodeId, onChangeNodeField, showToast]
)

  const nodeTypes = useMemo(
    () => ({
      textUpdater: (props) => (
        <CardNode
          {...props}
          onChangeNodeField={onChangeNodeField}
          onUploadFileForNode={onUploadFileForNode}
          setComposing={setComposing}
        />
      ),
    }),
    [onChangeNodeField, onUploadFileForNode, setComposing]
  )

  // autosave (PUT) + revision 갱신
  const saveTimer = useRef(null)
  useEffect(() => {
  if (revision == null) return

  if (skipNextSaveRef.current) {
    skipNextSaveRef.current = false
    return
  }

  if (saveTimer.current) clearTimeout(saveTimer.current)

  saveTimer.current = setTimeout(() => {
    saveWorkflow()
  }, 1000)

  return () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
  }
}, [nodes, edges, wfName, revision, saveWorkflow])

  return (
    <section className="wf">
      <div className="wf__frame">
        <div className="wfTop">
          <div className="wfTop__left wfTop__menuWrap" ref={wfMenuRef}>
            <button
              type="button"
              className="wfTop__back"
              onClick={() => setWfMenuOpen((v) => !v)}
              aria-label="워크플로우"
            >
              <img src={workflowIcon} alt="워크플로우 리스트 아이콘" className="wfTop__backIcon" />
            </button>

            <div className="wfTop__title" aria-hidden="true">
              {wfName}
            </div>

            {wfMenuOpen && (
              <div className="wfTop__menu">
                {workflowList.map((wf) => (
                  <button
                    key={wf.id}
                    type="button"
                    className={`wfTop__item ${wf.id === wid ? 'is-active' : ''}`}
                    onClick={() => {
                      setWfMenuOpen(false)
                      if (wf.id !== wid) onOpenWorkflow?.(wf.id)
                    }}
                  >
                    {wf.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="wfTop__addNode"
            onClick={() => {
              setWfMenuOpen(false)
              addNewNode()
            }}
            aria-label="노드 추가"
          >
            +
          </button>
        </div>

        <div className="wf__canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            deleteKeyCode={['Backspace', 'Delete']}
            multiSelectionKeyCode={['Shift']}
            // selectionKeyCode={null} // 드래그로 기본 선택
            onNodeClick={async (_, node) => {
              setSelectedNodeId(node.id)
              try {
                const files = await WorkflowsAPI.listNodeFiles(wid, node.id)
                setNodeFiles(files ?? [])
              } catch (e) {
                setNodeFiles([])
                showToast('파일을 불러오는 데 실패했어요. 다시 시도해 주세요.')
              }
            }}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineStyle={connectionLineStyle}
            onPaneClick={() => setWfMenuOpen(false)}
            onNodesDelete={async (deletedNodes) => {
              for (const node of deletedNodes) {
                try {
                  const files = await WorkflowsAPI.listNodeFiles(wid, node.id)
                  for (const f of files ?? []) {
                    await WorkflowsAPI.deleteNodeFile(wid, node.id, f.nodeFileId)
                  }
                } catch (e) {
                  showToast('노드 파일을 정리하는 데 실패했어요. 다시 시도해 주세요.')
                }
              }
            }}
          >
            <Controls />
          </ReactFlow>
          <ToastOverlay
            open={toast.open}
            message={toast.message}
            duration={1600}
            onClose={() => setToast((t) => ({ ...t, open: false }))}
          />
        </div>
      </div>
    </section>
  )
}

/* 노드 컴포넌트 */
/* WorkflowScreen.jsx 안의 CardNode 컴포넌트 */
function CardNode({ id, data, onChangeNodeField, onUploadFileForNode }) {
  const fileInputId = `file-input-${id}`

  // 1. 로컬 상태
  const [title, setTitle] = useState(data?.title ?? '')
  const [body, setBody] = useState(data?.body ?? '')
  
  // 2. 포커스 상태 & Refs
  const [isFocused, setIsFocused] = useState(false)
  const fileRef = useRef(null)
  const composingRef = useRef(false)
  const debounceTimer = useRef(null)

  // 3. 외부 데이터 동기화 (포커스 없을 때만)
  useEffect(() => {
    if (!isFocused && data?.title !== undefined && data.title !== title) {
      setTitle(data.title)
    }
  }, [data?.title, isFocused])

  useEffect(() => {
    if (!isFocused && data?.body !== undefined && data.body !== body) {
      setBody(data.body)
    }
  }, [data?.body, isFocused])

  // 4. 디바운스 저장 함수 (값을 인자로 직접 받음)
  const debouncedUpdate = useCallback((field, newValue) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    
    // 1초(1000ms) 뒤에 저장 (너무 빠르면 실패 오버레이 뜸)
    debounceTimer.current = setTimeout(() => {
      onChangeNodeField(id, { [field]: newValue })
    }, 1000) 
  }, [id, onChangeNodeField])

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)
  const stopDeleteKeys = (e) => {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.stopPropagation()
    }
  } 

  return (
    <div className="wfNode">
      <input
        className="wfNode__title nodrag"
        value={title}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={stopDeleteKeys}
        
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={(e) => {
          composingRef.current = false
          const v = e.target.value
          setTitle(v)
          // 방금 완성된 v를 직접 넘김
          debouncedUpdate('title', v) 
        }}
        onChange={(e) => {
          const v = e.target.value
          setTitle(v) // 화면은 즉시 갱신
          
          if (composingRef.current || e.nativeEvent.isComposing) return
          
          // v를 직접 넘김
          debouncedUpdate('title', v)
        }}
        placeholder="소제목"
      />

      <textarea
        className="wfNode__body nodrag"
        value={body}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={stopDeleteKeys}
        
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={(e) => {
          composingRef.current = false
          const v = e.target.value
          setBody(v)
          debouncedUpdate('body', v)
        }}
        onChange={(e) => {
          const v = e.target.value
          setBody(v)
          if (composingRef.current || e.nativeEvent.isComposing) return
          debouncedUpdate('body', v)
        }}
        placeholder="내용 입력하는 부분"
        rows={3}
      />

      <div className="wfNode__footer">
        <button
          type="button"
          className="wfNode__iconBtn nodrag"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            fileRef.current?.click()
          }}
          title="파일 추가"
        >
          <img className="wfNode__iconImg" src={folderPlus} alt="" />
        </button>

        <input
          ref={fileRef}
          className="wfNode__fileInput nodrag"
          type="file"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const file = e.target.files?.[0]
            onUploadFileForNode(id, file)
            e.target.value = ''
          }}
        />

        <div className="wfNode__fileName">
          {data?.fileName ? data.fileName : '파일명.pdf'}
        </div>
      </div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}