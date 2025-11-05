/**
 * My Posts page - shows user's own posts and allows deletion
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import { postsAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const MyPosts = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchMyPosts();
    }, [isAuthenticated]);

    const fetchMyPosts = async () => {
        try {
            const response = await postsAPI.getMyPosts();
            setPosts(response.data);
        } catch (err) {
            setError('Failed to load your posts');
            console.error('Error fetching my posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (uuid) => {
        try {
            await postsAPI.likePost(uuid);
            fetchMyPosts();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDelete = async (uuid) => {
        try {
            await postsAPI.deletePost(uuid);
            fetchMyPosts();
        } catch (error) {
            alert('Failed to delete post');
            console.error('Error deleting post:', error);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading your posts...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>My Posts</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#fef3c7' }}>
                <p style={{ margin: 0 }}>
                    <strong>Note:</strong> You can delete your posts within 24 hours of creation. Posts
                    will be automatically deleted after 24 hours.
                </p>
            </div>

            <div>
                {posts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>You haven't posted anything yet.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/')}
                            style={{ marginTop: '1rem' }}
                        >
                            Go to Feed
                        </button>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post.uuid}
                            post={post}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            showComments={true}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MyPosts;
