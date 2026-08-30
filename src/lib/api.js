import axios from "axios";

// PassVaultapi always answers with HTTP 200 and puts the real outcome in the
// body -- { success, status, result } on success, { success:false, error } on
// failure -- so the interceptors below translate that into normal
// resolve/reject behavior for callers.
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const VAULT_TOKEN_KEY = "passvault.clientToken";

export const getStoredToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(VAULT_TOKEN_KEY) : null;

export const setStoredToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(VAULT_TOKEN_KEY, token);
  else localStorage.removeItem(VAULT_TOKEN_KEY);
};

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && data.success === false) {
      return Promise.reject({
        message: data.error?.message || data.message || "Something went wrong.",
        title: data.title,
      });
    }
    if (data?.result?.token) {
      setStoredToken(data.result.token);
    }
    return data;
  },
  (error) => {
    const data = error.response?.data;
    return Promise.reject({
      message: data?.error?.message || data?.message || "Unable to reach the server. Please try again.",
      title: data?.title,
    });
  }
);

export default axiosInstance;
