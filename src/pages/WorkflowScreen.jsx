import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  // MiniMap,
  Controls,
  // Background,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '../styles/WorkflowScreen.css'
import folderPlus from '../assets/folder-plus.png'
import workflowIcon from '../assets/button_projSelect.png'

const LIST_KEY = 'workflows:index'

function loadWorkflowList() {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const initialNodes = [
  {
    id: 'n1',
    type: 'textUpdater',
    position: { x: 80, y: 120 },
    data: { title: '소제목', body: '내용 입력하는 부분', fileName: '' },
  },
  {
    id: 'n2',
    type: 'textUpdater',
    position: { x: 520, y: 120 },
    data: { title: '소제목', body: '내용 입력하는 부분', fileName: '파일명.pdf' },
  },
]

const initialEdges = [
  { id: 'e1-2', source: 'n1', target: 'n2', type: 'smoothstep' },
]

function loadFromLocalStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.nodes || !parsed?.edges) return null
    return parsed
  } catch {
    return null
  }
}

function saveToLocalStorage(key, doc) {
  localStorage.setItem(key, JSON.stringify(doc))
}

export default function WorkflowScreen({ workflowId, onGoWorkflowList, onOpenWorkflow }) {
  const storageKey = `workflow:${workflowId}`

  const [wfMenuOpen, setWfMenuOpen] = useState(false);
  const wfMenuRef = useRef(null)
  
  const workflowList = useMemo(() => loadWorkflowList(), [])
  const currentWfName = useMemo(() => {
    return workflowList.find((wf) => wf.id === workflowId)?.name ?? '워크플로우'
}, [workflowId, workflowList])

useEffect(() => {
    const onDown = (e) => {
        if (wfMenuRef.current && !wfMenuRef.current.contains(e.target)) {
            setWfMenuOpen(false)
        }
    }

    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
}, [])
  
  const saved = useMemo(() => loadFromLocalStorage(storageKey), [storageKey])
  const [nodes, setNodes] = useState(saved?.nodes ?? initialNodes)
  const [edges, setEdges] = useState(saved?.edges ?? initialEdges)

  const addNewNode = useCallback(() => {
  const newId = `n-${Date.now()}`
  setNodes((ns) => {
    // 가장 아래쪽에 추가
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

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      style: { stroke: 'var(--pink-main)', strokeWidth: 2 },
    }),
    []
  )

  const connectionLineStyle = useMemo(
    () => ({ stroke: 'var(--pink-main)', strokeWidth: 2 }),
    []
  )

  const onNodesChange = useCallback(
    (changes) => setNodes((snap) => applyNodeChanges(changes, snap)),
    []
  )

  const onEdgesChange = useCallback(
    (changes) => setEdges((snap) => applyEdgeChanges(changes, snap)),
    []
  )

  const onConnect = useCallback(
    (params) => setEdges((snap) => addEdge({ ...params, type: 'smoothstep' }, snap)),
    []
  )

  // 노드 텍스트 변경
  const onChangeNodeField = useCallback((id, patch) => {
    setNodes((ns) =>
      ns.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n))
    )
  }, [])

  // 노드별 파일 업로드
  const onUploadFileForNode = useCallback((nodeId, file) => {
    if (!file) return
    // 파일 자체는 저장 안 하고 이름만 저장
    onChangeNodeField(nodeId, { fileName: file.name })
  }, [onChangeNodeField])

  const nodeTypes = useMemo(
    () => ({
      textUpdater: (props) => (
        <CardNode
          {...props}
          onChangeNodeField={onChangeNodeField}
          onUploadFileForNode={onUploadFileForNode}
        />
      ),
    }),
    [onChangeNodeField, onUploadFileForNode]
  )

  // 저장(디바운스)
  const saveTimer = useRef(null)
  useEffect(() => {
    const doc = { nodes, edges, meta: { updatedAt: new Date().toISOString(), schemaVersion: 1 } }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveToLocalStorage(storageKey, doc), 400)
    return () => saveTimer.current && clearTimeout(saveTimer.current)
  }, [nodes, edges, storageKey])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!wfMenuOpen) return
      
      if (wfMenuRef.current && !wfMenuRef.current.contains(event.target)) {
        setWfMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mouse', handleClickOutside)
  }, [wfMenuOpen])

  return (
    <section className="wf">
      <div className="wf__frame">
        <div className='wfTop'>
          <div className='wfTop__left wfTop__menuWrap' ref={wfMenuRef}>
            <button
            type='button'
                className="wfTop__back"
                onClick={() => setWfMenuOpen((v) => !v)}
                aria-label='워크플로우'
            >
                <img src={workflowIcon} alt="워크플로우 리스트 아이콘" className='wfTop__backIcon' />
            </button>

            <div className='wfTop__title' aria-hidden='true'>{currentWfName}</div>

            {wfMenuOpen && (
              // 리스트로 돌아가기 메뉴
                  <div className="wfTop__menu">

                    <div className='wfTop__divider' />

                    {workflowList.map((wf) => (
                      <button
                        key={wf.id}
                        type="button"
                        className={`wfTop__item ${wf.id === workflowId ? 'is-active' : ''}`}
                        onClick={() => {
                          setWfMenuOpen(false)
                          if (wf.id !== workflowId) onOpenWorkflow?.(wf.id)
                        }}
                      >
                        {wf.name}
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <button
                type='button'
                className='wfTop__addNode'
                onClick={() => {
                  setWfMenuOpen(false)
                  addNewNode()
                }}
                aria-label='노드 추가'
            >
                +
            </button>
        </div>

        <div className="wf__canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineStyle={connectionLineStyle}
            onPaneClick={() => setWfMenuOpen(false)}
          >
            {/* <MiniMap /> */}
            <Controls />
            {/* <Background /> */}
          </ReactFlow>
        </div>
      </div>
    </section>
  )
}

/* 노드 컴포넌트 */
function CardNode({ id, data, onChangeNodeField, onUploadFileForNode }) {
  const fileInputId = `file-input-${id}`

  return (
    <div className="wfNode">
      {/* 타이틀 */}
      <input
        className="wfNode__title nodrag"
        value={data?.title ?? ''}
        onChange={(e) => onChangeNodeField(id, { title: e.target.value })}
        placeholder="소제목"
      />

      {/* 바디 */}
      <textarea
        className="wfNode__body nodrag"
        value={data?.body ?? ''}
        onChange={(e) => onChangeNodeField(id, { body: e.target.value })}
        placeholder="내용 입력하는 부분"
        rows={3}
      />

      {/* 하단 바: 아이콘 + 파일명 */}
      <div className="wfNode__footer">
        <label className="wfNode__iconBtn nodrag" htmlFor={fileInputId} title="파일 추가">
            <img className="wfNode__iconImg" src={folderPlus} alt="" />
        </label>

        <input
          id={fileInputId}
          className="wfNode__fileInput nodrag"
          type="file"
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