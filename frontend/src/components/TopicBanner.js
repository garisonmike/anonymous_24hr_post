/**
 * Topic banner component to display daily topics
 */
import { useEffect, useState } from 'react';
import { topicsAPI } from '../services/api';

const TopicBanner = () => {
    const [topic, setTopic] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTodayTopic();
    }, []);

    const fetchTodayTopic = async () => {
        try {
            const response = await topicsAPI.getTodayTopic();
            setTopic(response.data);
        } catch (error) {
            console.error('Error fetching topic:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return null;
    }

    if (!topic) {
        return null;
    }

    return (
        <div className="topic-banner">
            <h2>Today's Topic</h2>
            <p style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{topic.topic}</p>
        </div>
    );
};

export default TopicBanner;
