"""
Utility functions for content filtering and validation
"""
import re
import random
from better_profanity import profanity
from .models import FilteredWord

# Initialize profanity filter
profanity.load_censor_words()


def generate_random_color():
    """Generate a random hex color for avatar"""
    colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b',
        '#10b981', '#06b6d4', '#3b82f6', '#a855f7', '#ef4444',
        '#14b8a6', '#f97316', '#84cc16', '#22c55e', '#6366f1'
    ]
    return random.choice(colors)


def mask_profanity(text):
    """Mask profanity in text"""
    # Use better-profanity for basic filtering
    censored = profanity.censor(text, '*')
    
    # Apply custom filtered words from database
    filtered_words = FilteredWord.objects.filter(is_active=True)
    for fw in filtered_words:
        # Case-insensitive replacement
        pattern = re.compile(re.escape(fw.word), re.IGNORECASE)
        censored = pattern.sub(fw.replacement, censored)
    
    return censored


def detect_prohibited_content(text):
    """
    Detect prohibited content like URLs, emails, phone numbers, handles
    Returns list of violation types
    """
    violations = []
    
    # URL pattern
    url_pattern = r'(https?://|www\.)\S+|[a-zA-Z0-9-]+\.(com|net|org|edu|gov|io|co|app|dev)\S*'
    if re.search(url_pattern, text, re.IGNORECASE):
        violations.append('URL/link')
    
    # Email pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if re.search(email_pattern, text):
        violations.append('email address')
    
    # Phone number pattern (various formats)
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,}'
    if re.search(phone_pattern, text):
        violations.append('phone number')
    
    # Social media handles
    handle_pattern = r'@[A-Za-z0-9_]+'
    if re.search(handle_pattern, text):
        violations.append('social media handle')
    
    return violations


def filter_content(text):
    """
    Main content filtering function
    Returns: (filtered_text, violations_list)
    """
    # Check for prohibited content first
    violations = detect_prohibited_content(text)
    
    if violations:
        return text, violations
    
    # Apply profanity filtering
    filtered_text = mask_profanity(text)
    
    return filtered_text, []


def validate_post_content(content):
    """
    Validate post content
    Returns: (is_valid, filtered_content, error_message)
    """
    if not content or len(content.strip()) == 0:
        return False, content, "Content cannot be empty"
    
    if len(content) > 5000:
        return False, content, "Content exceeds maximum length of 5000 characters"
    
    filtered, violations = filter_content(content)
    
    if violations:
        return False, content, f"Content contains prohibited items: {', '.join(violations)}"
    
    return True, filtered, None
