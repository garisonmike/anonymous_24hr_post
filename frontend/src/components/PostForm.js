/**
 * Post form component for creating posts and comments
 */
import { useState } from 'react';
import { postsAPI } from '../services/api';
import { validateContent } from '../utils/helpers';

const PostForm = ({ parentUuid = null, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate content
        const errors = validateContent(content);
        if (errors.length > 0) {
            setError(errors.join('. '));
            return;
        }

        setLoading(true);

        try {
            await postsAPI.createPost(content, null, parentUuid);
            setContent('');
            if (onPostCreated) {
                onPostCreated();
            }
        } catch (err) {
            if (err.response?.data?.content) {
                setError(err.response.data.content[0]);
            } else {
                setError('Failed to create post. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const placeholderText = parentUuid
        ? 'Write a comment...'
        : 'Share something anonymously...';

    const buttonText = parentUuid ? 'Comment' : 'Post';

    return (
        <div className="card">
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <div className="form-group">
                    <textarea
                        className="form-control"
                        placeholder={placeholderText}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={5000}
                        disabled={loading}
                    />
                    <small style={{ color: '#6b7280', marginTop: '0.5rem', display: 'block' }}>
                        {content.length}/5000 characters
                    </small>
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || content.trim().length === 0}
                >
                    {loading ? 'Posting...' : buttonText}
                </button>
            </form>
        </div>
    );
};

export default PostForm;
