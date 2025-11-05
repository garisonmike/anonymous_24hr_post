/**
 * Authentication context for managing user state
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password, passwordConfirm, email) => {
        const response = await authAPI.register(username, password, passwordConfirm, email);
        setUser(response.data.user);
        return response;
    };

    const login = async (username, password) => {
        const response = await authAPI.login(username, password);
        setUser(response.data.user);
        return response;
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
