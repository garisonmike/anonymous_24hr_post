/**
 * Post detail page showing a single post with comments
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import { postsAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';

const PostDetail = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPost();
    }, [uuid]);

    const fetchPost = async () => {
        try {
            const response = await postsAPI.getPost(uuid);
            setPost(response.data);
        } catch (err) {
            setError('Failed to load post');
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postUuid) => {
        try {
            await postsAPI.likePost(postUuid);
            fetchPost(); // Refresh to get updated data
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDelete = async (postUuid) => {
        try {
            await postsAPI.deletePost(postUuid);
            navigate('/');
        } catch (error) {
            alert('Failed to delete post');
            console.error('Error deleting post:', error);
        }
    };

    const handleCommentCreated = () => {
        fetchPost();
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading post...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container">
                <div className="error-message">{error || 'Post not found'}</div>
                <button className="btn btn-primary" onClick={() => navigate('/')}>
                    Back to Feed
                </button>
            </div>
        );
    }

    return (
        <div className="container">
            <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
                style={{ marginBottom: '1rem' }}
            >
                ← Back to Feed
            </button>

            <PostCard post={post} onLike={handleLike} onDelete={handleDelete} showComments={false} />

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                Comments ({post.comments?.length || 0})
            </h3>

            {isAuthenticated ? (
                <PostForm parentUuid={post.uuid} onPostCreated={handleCommentCreated} />
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Login to comment</p>
                </div>
            )}

            <div>
                {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                        <PostCard
                            key={comment.uuid}
                            post={comment}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            showComments={false}
                        />
                    ))
                ) : (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetail;
