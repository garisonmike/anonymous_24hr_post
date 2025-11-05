/**
 * Main App component with routing
 */
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import MyPosts from './pages/MyPosts';
import PostDetail from './pages/PostDetail';
import Register from './pages/Register';
import { AuthProvider } from './utils/AuthContext';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/post/:uuid" element={<PostDetail />} />
                        <Route path="/my-posts" element={<MyPosts />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
