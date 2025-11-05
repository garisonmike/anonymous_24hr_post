/**
 * Home page with feed of posts
 */
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import TopicBanner from '../components/TopicBanner';
import { postsAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await postsAPI.getPosts();
            setPosts(response.data.results || response.data);
        } catch (err) {
            setError('Failed to load posts');
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostCreated = () => {
        fetchPosts();
    };

    const handleLike = async (uuid) => {
        try {
            await postsAPI.likePost(uuid);
            fetchPosts(); // Refresh to get updated like count
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDelete = async (uuid) => {
        try {
            await postsAPI.deletePost(uuid);
            fetchPosts();
        } catch (error) {
            alert('Failed to delete post');
            console.error('Error deleting post:', error);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading posts...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <TopicBanner />

            {isAuthenticated ? (
                <PostForm onPostCreated={handlePostCreated} />
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ marginBottom: '1rem' }}>
                        Login or register to post and comment anonymously
                    </p>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div>
                {posts.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>No posts yet. Be the first to post something!</p>
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

export default Home;
