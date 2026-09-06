import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true
});

export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const logout = () => API.post('/auth/logout');
export const getMe = () => API.get('/auth/me');
export const saveMessage = (repoId, data) => API.post('/chat/save', { repoId, ...data });
export const getHistory = (repoId) => API.get('/chat/history', { params: { repoId } });
export const ingestRepo = (data) => API.post('/chat/ingest', data);
export const getUserChats = () => API.get('/chat/user-chats');

export default API;
