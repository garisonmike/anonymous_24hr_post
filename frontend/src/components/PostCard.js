/**
 * Post card component to display individual posts/comments
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import {
    formatRelativeTime,
    generateAnonymousName,
    getInitials,
    getTimeRemaining,
} from '../utils/helpers';

const PostCard = ({ post, onDelete, onLike, showComments = true }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportReason, setReportReason] = useState('spam');
    const [reportDescription, setReportDescription] = useState('');
    const [reportLoading, setReportLoading] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);

    const handleLike = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (onLike) {
            onLike(post.uuid);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            if (onDelete) {
                onDelete(post.uuid);
            }
        }
    };

    const handleReport = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setReportLoading(true);
        try {
            await reportsAPI.createReport(post.uuid, reportReason, reportDescription);
            setReportSuccess(true);
            setShowReportForm(false);
            setTimeout(() => setReportSuccess(false), 3000);
        } catch (error) {
            alert('Failed to submit report. You may have already reported this post.');
        } finally {
            setReportLoading(false);
        }
    };

    const handleViewPost = () => {
        if (!post.is_comment) {
            navigate(`/post/${post.uuid}`);
        }
    };

    const anonymousName = generateAnonymousName(post.uuid);
    const initials = getInitials(anonymousName);

    return (
        <div className="post-card">
            {reportSuccess && (
                <div className="success-message" style={{ marginBottom: '1rem' }}>
                    Report submitted successfully
                </div>
            )}

            <div className="post-header">
                <div className="post-avatar" style={{ backgroundColor: post.avatar_color }}>
                    {initials}
                </div>
                <div>
                    <div style={{ fontWeight: '500' }}>{anonymousName}</div>
                    <div className="post-meta">
                        {formatRelativeTime(post.timestamp)} · {post.views} views
                        {!post.is_comment && ` · ${post.comments_count || 0} comments`}
                    </div>
                </div>
            </div>

            <div className="post-content" onClick={showComments ? handleViewPost : undefined}>
                {post.content}
            </div>

            <div className="post-actions">
                <button
                    className={`action-btn ${post.is_liked_by_user ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <span>{post.is_liked_by_user ? '❤️' : '🤍'}</span>
                    <span>{post.likes_count || 0}</span>
                </button>

                {showComments && !post.is_comment && (
                    <button className="action-btn" onClick={handleViewPost}>
                        <span>💬</span>
                        <span>{post.comments_count || 0} comments</span>
                    </button>
                )}

                {post.is_owned_by_user && post.can_be_deleted_by_user && (
                    <button className="action-btn" onClick={handleDelete}>
                        <span>🗑️</span>
                        <span>Delete</span>
                    </button>
                )}

                <button className="action-btn" onClick={() => setShowReportForm(!showReportForm)}>
                    <span>🚩</span>
                    <span>Report</span>
                </button>
            </div>

            {post.is_owned_by_user && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    {getTimeRemaining(post.timestamp)}
                </div>
            )}

            {showReportForm && (
                <form
                    onSubmit={handleReport}
                    style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                    }}
                >
                    <div className="form-group">
                        <label className="form-label">Reason</label>
                        <select
                            className="form-control"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        >
                            <option value="spam">Spam</option>
                            <option value="harassment">Harassment</option>
                            <option value="hate_speech">Hate Speech</option>
                            <option value="violence">Violence</option>
                            <option value="self_harm">Self-harm</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description (optional)</label>
                        <textarea
                            className="form-control"
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            rows="3"
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={reportLoading}>
                            {reportLoading ? 'Submitting...' : 'Submit Report'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowReportForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PostCard;
