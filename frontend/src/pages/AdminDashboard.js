/**
 * Admin dashboard for content moderation
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import { useAuth } from '../utils/AuthContext';
import {
    formatRelativeTime,
    generateAnonymousName,
    getInitials,
} from '../utils/helpers';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated || !user?.is_staff) {
            navigate('/');
            return;
        }
        fetchPendingReports();
    }, [isAuthenticated, user]);

    const fetchPendingReports = async () => {
        try {
            const response = await reportsAPI.getPendingReports();
            setReports(response.data);
        } catch (err) {
            setError('Failed to load reports');
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (reportId, action) => {
        try {
            await reportsAPI.reviewReport(reportId, action);
            fetchPendingReports();
        } catch (error) {
            alert('Failed to review report');
            console.error('Error reviewing report:', error);
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Loading reports...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard - Pending Reports</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#fef3c7' }}>
                <p style={{ margin: 0 }}>
                    <strong>Note:</strong> You can review reports and delete inappropriate content without
                    seeing user identities. All posts are anonymous.
                </p>
            </div>

            {reports.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>No pending reports. Great job keeping the community safe!</p>
                </div>
            ) : (
                reports.map((report) => (
                    <div key={report.id} className="card" style={{ marginBottom: '1.5rem' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <strong>Report #{report.id}</strong>
                                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                    {formatRelativeTime(report.timestamp)}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Reason: <strong>{report.reason.replace('_', ' ')}</strong>
                            </div>
                            {report.description && (
                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                    Description: {report.description}
                                </div>
                            )}
                        </div>

                        {report.post_details && (
                            <div
                                style={{
                                    backgroundColor: '#f9fafb',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <div
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            backgroundColor: report.post_details.avatar_color,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '0.875rem',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {getInitials(generateAnonymousName(report.post_details.uuid))}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                                            {generateAnonymousName(report.post_details.uuid)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {formatRelativeTime(report.post_details.timestamp)}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                                    {report.post_details.content}
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleReview(report.id, 'delete_post')}
                            >
                                Delete Post
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleReview(report.id, 'mark_reviewed')}
                            >
                                Mark Reviewed
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleReview(report.id, 'dismiss')}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminDashboard;
