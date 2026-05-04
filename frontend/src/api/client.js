import apiClient from '../services/api'

export default apiClient

const withData = (request) => request.then((response) => ({
    ...response,
    data: response.data?.data ?? response.data,
}))

// ── API Helper Functions ─────────────────────────────────────
export const productsAPI = {
    getProducts: (params) => withData(apiClient.get('/products/', { params })),
    getProduct: (id) => withData(apiClient.get(`/products/${id}`)),
    createProduct: (data) => withData(apiClient.post('/products/', data)),
    updateProduct: (id, data) => withData(apiClient.put(`/products/${id}`, data)),
    deleteProduct: (id) => withData(apiClient.delete(`/products/${id}`)),
}

export const transactionsAPI = {
    checkout: (data) => withData(apiClient.post('/transactions/checkout', data)),
    getTransactions: (params) => withData(apiClient.get('/transactions/', { params })),
    getTransaction: (id) => withData(apiClient.get(`/transactions/${id}`)),
}

// ── Aliases (used by pages and components) ───────────────────
export const productsApi = {
    getAll: (params) => withData(apiClient.get('/products/', { params })),
    getOne: (id) => withData(apiClient.get(`/products/${id}`)),
    create: (data) => withData(apiClient.post('/products/', data)),
    update: (id, data) => withData(apiClient.put(`/products/${id}`, data)),
    delete: (id) => withData(apiClient.delete(`/products/${id}`)),
    toggleStatus: (id) => withData(apiClient.patch(`/products/${id}/toggle`)),
}

export const transactionsApi = {
    checkout: (data) => withData(apiClient.post('/transactions/checkout', data)),
    getAll: (params) => withData(apiClient.get('/transactions/', { params })),
    getOne: (id) => withData(apiClient.get(`/transactions/${id}`)),
}

export const txApi = transactionsApi
