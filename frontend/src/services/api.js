/**
 * API service for communicating with Django backend
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for session authentication
});

// Add CSRF token to requests
api.interceptors.request.use((config) => {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
});

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Authentication API
export const authAPI = {
    register: (username, password, passwordConfirm, email = '') => {
        return api.post('/api/auth/register/', {
            username,
            password,
            password_confirm: passwordConfirm,
            email,
        });
    },

    login: (username, password) => {
        return api.post('/api/auth/login/', { username, password });
    },

    logout: () => {
        return api.post('/api/auth/logout/');
    },

    getCurrentUser: () => {
        return api.get('/api/auth/me/');
    },
};

// Posts API
export const postsAPI = {
    getPosts: (page = 1, parentUuid = null) => {
        const params = { page };
        if (parentUuid) {
            params.parent_uuid = parentUuid;
        }
        return api.get('/api/posts/', { params });
    },

    getPost: (uuid) => {
        return api.get(`/api/posts/${uuid}/`);
    },

    createPost: (content, topicId = null, parentUuid = null) => {
        return api.post('/api/posts/', {
            content,
            topic: topicId,
            parent_uuid: parentUuid,
        });
    },

    deletePost: (uuid) => {
        return api.delete(`/api/posts/${uuid}/`);
    },

    likePost: (uuid) => {
        return api.post(`/api/posts/${uuid}/like/`);
    },

    getMyPosts: () => {
        return api.get('/api/posts/my_posts/');
    },
};

// Topics API
export const topicsAPI = {
    getTopics: () => {
        return api.get('/api/topics/');
    },

    getTodayTopic: () => {
        return api.get('/api/topics/today/');
    },
};

// Reports API
export const reportsAPI = {
    createReport: (postUuid, reason, description = '') => {
        return api.post('/api/moderation/reports/', {
            post: postUuid,
            reason,
            description,
        });
    },

    getMyReports: () => {
        return api.get('/api/moderation/reports/');
    },

    getPendingReports: () => {
        return api.get('/api/moderation/reports/pending/');
    },

    reviewReport: (reportId, action) => {
        return api.post(`/api/moderation/reports/${reportId}/review/`, { action });
    },
};

export default api;
