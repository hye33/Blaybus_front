// src/workflowMapping.js

// 서버 -> ReactFlow
export function fromServerToReactFlow(serverData) {
  const nodes = (serverData?.nodes ?? []).map((n) => ({
    id: n.id,
    type: 'textUpdater',
    position: { x: n.positionX ?? 0, y: n.positionY ?? 0 },
    data: { title: n.name ?? '', body: n.content ?? '', fileName: '' },
  }))

  const edges = (serverData?.edges ?? []).map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
  }))

  return { nodes, edges }
}

// ReactFlow -> 서버
export function fromReactFlowToServer(nodes, edges) {
  return {
    nodes: (nodes ?? []).map((n) => ({
      id: n.id,
      name: n.data?.title ?? '',
      content: n.data?.body ?? '',
      positionX: n.position?.x ?? 0,
      positionY: n.position?.y ?? 0,
    })),
    edges: (edges ?? []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    })),
  }
}