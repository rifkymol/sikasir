import axios from "axios";

const apiClient = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 5000, // 5 seconds timeout
});

apiClient.interceptors.response.use(
    config => config,
    error => {
        if (error.response) {
            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Handle unauthorized error
                    break;
                case 403:
                    // Handle forbidden error
                    break;
                case 404:
                    // Handle not found error
                    break;
                case 500:
                    // Handle internal server error
                    break;
                default:
                    // Handle other errors
                    break;
            }
        }
        return Promise.reject(error);
    }
);

apiClient.interceptors.request.use(
    response => response,
    error => {
        if (!error.response) {
            // Handle network errors
            console.error("Network error:", error);
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// ── Response Interceptor ─────────────────────────────────────

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.warn("API error:", error.response.status, error.response.data);
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// ── API Helper Functions ─────────────────────────────────────
export const productsAPI = {
    getProducts: (params) => apiClient.get("/products", { params }),
    getProduct: (id) => apiClient.get(`/products/${id}`),
    createProduct: (data) => apiClient.post("/products", data),
    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`),
};

export const transactionsAPI = {
    checkout: (data) => apiClient.post("/transactions/checkout", data),
    getTransactions: (params) => apiClient.get("/transactions", { params }),
    getTransaction: (id) => apiClient.get(`/transactions/${id}`),
};
