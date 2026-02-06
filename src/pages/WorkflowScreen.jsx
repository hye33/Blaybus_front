// import React from 'react'

// export default function WorkflowScreen() {
//     return <div>Workflow Screen</div>
// }

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position,
  MiniMap,
  Controls,
  Background,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import '../styles/WorkflowScreen.css'

const STORAGE_KEY = 'my-react-flow-app-nodes-edges'

const initialNodes = [
  { id: 'n1', type: 'textUpdater', position: { x: 0, y: 0 }, data: { label: 'Node 9000', value: 'hello' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
  {
    id: 'n3',
    type: 'textUpdater',
    position: { x: 0, y: 240 },
    data: { label: 'Impellar Blade', value: '회전 시 공기를 밀어 추력을 발생시키는 블레이드 부품. 드론 비행에 필요한 양력을 생성.' },
  },
]
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2', type: 'step', label: '노드 중간 텍스트 입력' }]

function localFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.nodes || !parsed.edges) return null
    return parsed
  } catch {
    return null
  }
}

function saveToLocalStorage(doc) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doc))
}

export default function WorkflowScreen({workflowId, onBack}) {
  const STORAGE_KEY = `workflow:${workflowId}`
  const saved = useMemo(() => localFromLocalStorage(), [])
  const [nodes, setNodes] = useState(saved?.nodes ?? initialNodes)
  const [edges, setEdges] = useState(saved?.edges ?? initialEdges)

  const onNodesChange = useCallback(
    (changes) => setNodes((snap) => applyNodeChanges(changes, snap)),
    []
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((snap) => applyEdgeChanges(changes, snap)),
    []
  )
  const onConnect = useCallback(
    (params) => setEdges((snap) => addEdge(params, snap)),
    []
  )

  const onChangeNodeValue = useCallback((id, value) => {
    setNodes((ns) =>
      ns.map((node) => (node.id === id ? { ...node, data: { ...node.data, value } } : node))
    )
  }, [])

  const onUploadFile = useCallback((event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const newId = `file-${Date.now()}`

    setNodes((ns) => {
      const maxY = ns.reduce((m, n) => Math.max(m, n.position?.y ?? 0), 0)
      return [
        ...ns,
        {
          id: newId,
          type: 'fileNode',
          position: { x: 0, y: maxY + 120 },
          data: { label: file.name, fileName: file.name, value: '' },
        },
      ]
    })

    event.target.value = ''
  }, [])

  const nodeTypes = useMemo(
    () => ({
      textUpdater: (props) => <TextUpdaterNode {...props} onChangeNodeValue={onChangeNodeValue} />,
      fileNode: (props) => <FileNode {...props} onChangeNodeValue={onChangeNodeValue} />,
    }),
    [onChangeNodeValue]
  )

  const saveTimer = useRef(null)
  useEffect(() => {
    const doc = { nodes, edges, meta: { updatedAt: new Date().toISOString(), schemaVersion: 1 } }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveToLocalStorage(doc), 400)
    return () => saveTimer.current && clearTimeout(saveTimer.current)
  }, [nodes, edges])

  return (
    <section className="wf">
      {/* 상단 업로드 바 */}
      <div className="wf__toolbar">
        <label className="wf__label">파일 업로드</label>
        <input className="wf__file" type="file" onChange={onUploadFile} />
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
        >
          <MiniMap />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </section>
  )
}

function TextUpdaterNode({ id, data, onChangeNodeValue }) {
  const onChange = useCallback((e) => onChangeNodeValue(id, e.target.value), [id, onChangeNodeValue])

  return (
    <div style={nodeBoxStyle}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{data?.label ?? 'Untitled'}</div>
      <input type="text" value={data?.value ?? ''} onChange={onChange} placeholder="텍스트 입력..." style={{ width: '100%' }} />
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

function FileNode({ id, data, onChangeNodeValue }) {
  const onChange = useCallback((e) => onChangeNodeValue(id, e.target.value), [id, onChangeNodeValue])

  return (
    <div style={{ ...nodeBoxStyle, minWidth: 220 }}>
      <div style={{ fontWeight: 800, marginBottom: 6 }}>파일명: {data?.fileName ?? '-'}</div>
      <input type="text" value={data?.value ?? ''} onChange={onChange} placeholder="메모 입력..." style={{ width: '100%' }} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeBoxStyle = {
  padding: 12,
  border: '1px solid #aaa',
  borderRadius: 10,
  background: 'white',
}