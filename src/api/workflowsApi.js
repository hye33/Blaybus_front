// src/api/workflowsApi.js
import { apiFetch } from './apiClient'

export const WorkflowsAPI = {
  list: () => apiFetch('/api/workflows'),

  create: (name) =>
    apiFetch('/api/workflows', {
      method: 'POST',
      body: {
        name,
        data: { nodes: [], edges: [] },
      },
    }),

  get: (workflowId) => apiFetch(`/api/workflows/${workflowId}`),

  update: (workflowId, { name, data, revision }) =>
    apiFetch(`/api/workflows/${workflowId}`, {
      method: 'PUT',
      body: { name, data, revision },
    }),

  remove: (workflowId) => apiFetch(`/api/workflows/${workflowId}`, { method: 'DELETE' }),

  listNodeFiles: (workflowId, clientNodeId) =>
    apiFetch(`/api/workflows/${workflowId}/nodes/${clientNodeId}/files`),

  async uploadNodeFile(workflowId, clientNodeId, file) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', file.name ?? 'upload')

    return apiFetch(`/api/workflows/${workflowId}/nodes/${clientNodeId}/files`, {
    method: 'POST',
    body: fd,
    isFormData: true,
    })
  },

  deleteNodeFile: (workflowId, clientNodeId, nodeFileId) => 
    apiFetch(`/api/workflows/${workflowId}/nodes/${clientNodeId}/files/${nodeFileId}`, {method: 'DELETE'}),

  patchNodeFile: (workflowId, clientNodeId, nodeFileId, { file, nodeFileName }) => {
    const fd = new FormData()
    if (file) fd.append('file', file)
    if (nodeFileName) fd.append('nodeFileName', nodeFileName)

    return apiFetch(`/api/workflows/${workflowId}/nodes/${clientNodeId}/files/${nodeFileId}`, {
      method: 'PATCH',
      body: fd,
      isFormData: true,
    })
  },
}