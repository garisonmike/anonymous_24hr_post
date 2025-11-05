/**
 * Utility functions for the application
 */
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp) => {
    try {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
        return 'recently';
    }
};

/**
 * Format timestamp to absolute time
 */
export const formatAbsoluteTime = (timestamp) => {
    try {
        return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (error) {
        return '';
    }
};

/**
 * Generate anonymous username from UUID
 */
export const generateAnonymousName = (uuid) => {
    if (!uuid) return 'Anonymous';
    // Take first 8 characters of UUID for short anonymous ID
    return `Anon-${uuid.substring(0, 8)}`;
};

/**
 * Get initials from anonymous name
 */
export const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split('-');
    if (parts.length > 1) {
        return parts[1].substring(0, 2).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Validate content before submission
 */
export const validateContent = (content) => {
    const errors = [];

    if (!content || content.trim().length === 0) {
        errors.push('Content cannot be empty');
    }

    if (content.length > 5000) {
        errors.push('Content exceeds maximum length of 5000 characters');
    }

    // Check for URLs
    const urlPattern = /(https?:\/\/|www\.)\S+|[a-zA-Z0-9-]+\.(com|net|org|edu|gov|io|co|app|dev)\S*/gi;
    if (urlPattern.test(content)) {
        errors.push('URLs and links are not allowed');
    }

    // Check for email addresses
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    if (emailPattern.test(content)) {
        errors.push('Email addresses are not allowed');
    }

    // Check for phone numbers
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,}/g;
    if (phonePattern.test(content)) {
        errors.push('Phone numbers are not allowed');
    }

    // Check for social media handles
    const handlePattern = /@[A-Za-z0-9_]+/g;
    if (handlePattern.test(content)) {
        errors.push('Social media handles are not allowed');
    }

    return errors;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Calculate time remaining until deletion
 */
export const getTimeRemaining = (timestamp) => {
    const createdAt = new Date(timestamp);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
    const now = new Date();
    const remaining = expiresAt - now;

    if (remaining <= 0) {
        return 'Expired';
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
};

/**
 * Check if user can still delete a post
 */
export const canDeletePost = (timestamp) => {
    const createdAt = new Date(timestamp);
    const now = new Date();
    const hoursPassed = (now - createdAt) / (1000 * 60 * 60);
    return hoursPassed < 24;
};
