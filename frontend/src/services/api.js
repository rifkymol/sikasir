import axios from 'axios'
import { showError } from '../lib/notifications'
import { getAuthToken } from '../utils/authSession'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message || error.response?.data?.detail || 'Coba lagi beberapa saat.'

        if (status === 401) {
            await showError('Sesi Berakhir', 'Silakan login kembali.')
        } else if (status !== 422) {
            await showError('Terjadi Kesalahan', message)
        }

        return Promise.reject(error)
    }
)

api.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api