import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as api from './api';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import ChatInterface from './Components/ChatInterface';

import { Toaster } from 'react-hot-toast';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await api.getMe();
                setUser({ id: data.id, name: data.username, email: data.email });
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (err) {
            console.error("Logout failed", err);
        } finally {
            setUser(null);
        }
    };

    if (loading) return <div className="h-screen bg-background-dark flex items-center justify-center text-white">Loading...</div>;

    return (
        <Router>
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#333',
                    color: '#fff',
                },
            }} />
            <Routes>
                <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
                <Route path="/" element={user ? <Dashboard onLogout={handleLogout} user={user} /> : <Navigate to="/login" />} />

                {/* Specific route for Owner/Repo/Branch */}
                <Route
                    path="/chat/:owner/:repo/:branch"
                    element={user ? <ChatInterface onLogout={handleLogout} user={user} /> : <Navigate to="/login" />}
                />

                {/* Fallback route for legacy IDs */}
                <Route
                    path="/chat/:repoId"
                    element={user ? <ChatInterface onLogout={handleLogout} user={user} /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
}

export default App;
