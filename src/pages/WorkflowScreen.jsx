import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
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

function safeId(prefix) {
  if (crypto?.randomUUID) return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`
}

function toServerDoc(nodes, edges) {
  return {
    nodes: nodes.map((n) => ({
      id: n.id, // files API의 clientNodeId가 됨
      name: n.data?.title ?? '',
      content: n.data?.body ?? '',
      positionX: n.position?.x ?? 0,
      positionY: n.position?.y ?? 0,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  }
}

function fromServerDoc(serverData) {
  return {
    nodes: (serverData?.nodes ?? []).map((n) => ({
      id: n.id,
      type: 'textUpdater',
      position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
      data: { title: n.name ?? '', body: n.content ?? '', fileName: '' },
    })),
    edges: (serverData?.edges ?? []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
    })),
  }
}

// const serverData = toServerDoc(nodes, edges)
//   await WorkflowsAPI.updateWorkflow(workflowId, {
//     name: currentWfName,
//     data: serverData,
//     revision,
//   })

export default function WorkflowScreen({ workflowId, onOpenWorkflow }) {
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

  // 워크플로우 상세 로딩
  useEffect(() => {
    ;(async () => {
      const detail = await WorkflowsAPI.get(workflowId)

      setWfName(detail.workflowName ?? '워크플로우')
      setRevision(detail.revision)

      const { nodes: rfNodes, edges: rfEdges } = fromServerToReactFlow(detail.data)

      skipNextSaveRef.current = true
      setNodes(rfNodes.length ? rfNodes : [])
      setEdges(rfEdges.length ? rfEdges : [])
    })()
  }, [workflowId])

  const defaultEdgeOptions = useMemo(
    () => ({ type: 'smoothstep', style: { stroke: 'var(--pink-main)', strokeWidth: 2 } }),
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

  const flushSave = useCallback(async () => {
  // revision 없으면 아직 상세 로딩 전이니까 저장 불가
  if (revision == null) throw new Error('Workflow not loaded yet')

  const wid = Number(workflowId)

  // 현재 화면 상태(nodes/edges)를 서버 포맷으로 변환해서 저장
  const data = fromReactFlowToServer(nodes, edges)

  const res = await WorkflowsAPI.update(wid, {
    name: wfName,
    data,
    revision,
  })

  // 서버가 준 최신 revision으로 갱신 (충돌 방지)
  setRevision(res.revision)

  // autosave 디바운스 타이머가 남아있으면, 다음 저장에서 중복 PUT 안 치게 살짝 스킵 처리
  skipNextSaveRef.current = true

  return res
}, [workflowId, wfName, nodes, edges, revision])

  // 노드 파일 업로드 (multipart -> S3 -> URL 저장)
  const onUploadFileForNode = useCallback(
  async (nodeId, file) => {
    if (!file) return

    const wid = Number(workflowId)

    try {
      // setIsUploading(true)

      // 1) 업로드 전에 저장을 한번 확정(노드 존재 보장)
      await flushSave()

      // 2) 업로드 (multipart: file + name)
      await WorkflowsAPI.uploadNodeFile(wid, nodeId, file)

      // 3) UI 반영(파일명)
      onChangeNodeField(nodeId, { fileName: file.name })

      // 4) (선택) 현재 선택 노드라면 파일 목록 새로고침
      if (selectedNodeId === nodeId) {
        const files = await WorkflowsAPI.listNodeFiles(wid, nodeId)
        setNodeFiles(files ?? [])
      }
    } catch (e) {
      console.error(e)

      // 저장 충돌이면 업로드 중단 + 재로딩 유도
      if (e.status === 409) {
        alert('저장 버전 충돌이 발생했습니다.')
        // 선택: 자동으로 재로딩까지 하고 싶으면 아래 주석 풀어도 됨
        // const detail = await WorkflowsAPI.get(wid)
        // setWfName(detail.workflowName ?? '워크플로우')
        // setRevision(detail.revision)
        // const { nodes: rfNodes, edges: rfEdges } = fromServerToReactFlow(detail.data)
        // skipNextSaveRef.current = true
        // setNodes(rfNodes)
        // setEdges(rfEdges)
        return
      }

      alert('파일 업로드에 실패했습니다.')
    } finally {
      // setIsUploading(false)
    }
  },
  [
    workflowId,
    flushSave,
    selectedNodeId,
    onChangeNodeField,
  ]
)

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

  // autosave (PUT) + revision 갱신
  const saveTimer = useRef(null)
  useEffect(() => {
    if (revision == null) return
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const data = fromReactFlowToServer(nodes, edges)
        const wid = Number(workflowId)
        const res = await WorkflowsAPI.update(wid, {
          name: wfName,
          data,
          revision,
        })
        setRevision(res.revision)
      } catch (err) {
        if (err.status === 409) {
          alert('버전 충돌로 파일을 다시 불러옵니다.')
          const detail = await WorkflowsAPI.get(workflowId)
          setWfName(detail.workflowName ?? '워크플로우')
          setRevision(detail.revision)
          const { nodes: rfNodes, edges: rfEdges } = fromServerToReactFlow(detail.data)
          if (skipNextSaveRef.current) {
            skipNextSaveRef.current = false
            return
          }
          setNodes(rfNodes)
          setEdges(rfEdges)
        } else {
          console.error(err)
        }
      }
    }, 400)

    return () => saveTimer.current && clearTimeout(saveTimer.current)
  }, [nodes, edges, wfName, workflowId, revision])

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
            onNodeClick={async (_, node) => {
              setSelectedNodeId(node.id)
              try {
                const files = await WorkflowsAPI.listNodeFiles(Number(workflowId), node.id)
                setNodeFiles(files ?? [])
              } catch (e) {
                if (e.status === 400) {
                  setNodeFiles([])
                  return
                }
                console.error(e)
                setNodeFiles([])
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
                  const files = await WorkflowsAPI.listNodeFiles(workflowId, node.id)

                  for (const f of files ?? []) {
                    await WorkflowsAPI.deleteNodeFile(workflowId, node.id, f.nodeFileId)
                  }
                } catch (e) {
                  console.error('노드 파일 정리 실패:', node.id, e)
                }
              }
            }}
          >
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </section>
  )
}

/* 노드 컴포넌트 */
function CardNode({ id, data, onChangeNodeField, onUploadFileForNode }) {
  const fileInputId = `file-input-${id}`

  const [title, setTitle] = useState(data?.title ?? '')
  const [body, setBody] = useState(data?.body ?? '')

  // 서버 로드/외부 변경이 들어오면 로컬도 동기화
  useEffect(() => setTitle(data?.title ?? ''), [data?.title])
  useEffect(() => setBody(data?.body ?? ''), [data?.body])

  const composingRef = useRef(false)

  return (
    <div className="wfNode">
      <input
        className="wfNode__title nodrag"
        value={title}
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={(e) => {
          composingRef.current = false
          const v = e.target.value
          setTitle(v)
          onChangeNodeField(id, { title: v }) // 조합 끝난 뒤 반영
        }}
        onChange={(e) => {
          const v = e.target.value
          setTitle(v) // 로컬만 갱신 (조합 안 깨짐)
          if (!composingRef.current) onChangeNodeField(id, { title: v })
        }}
        placeholder="소제목"
      />

      <textarea
        className="wfNode__body nodrag"
        value={body}
        onCompositionStart={() => (composingRef.current = true)}
        onCompositionEnd={(e) => {
          composingRef.current = false
          const v = e.target.value
          setBody(v)
          onChangeNodeField(id, { body: v })
        }}
        onChange={(e) => {
          const v = e.target.value
          setBody(v)
          if (!composingRef.current) onChangeNodeField(id, { body: v })
        }}
        placeholder="내용 입력하는 부분"
        rows={3}
      />

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