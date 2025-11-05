# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
The API uses session-based authentication. CSRF tokens are required for POST, PUT, PATCH, and DELETE requests.

### CSRF Token
Get CSRF token from cookies after first request. Include in all state-changing requests with header:
```
X-CSRFToken: <token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register/`

**Request Body:**
```json
{
  "username": "user123",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "email": "user@example.com"  // optional
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "user123",
    "date_joined": "2024-01-01T12:00:00Z"
  }
}
```

---

### Login
**POST** `/auth/login/`

**Request Body:**
```json
{
  "username": "user123",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "user123",
    "date_joined": "2024-01-01T12:00:00Z"
  }
}
```

---

### Logout
**POST** `/auth/logout/`

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### Get Current User
**GET** `/auth/me/`

**Success Response (200):**
```json
{
  "id": 1,
  "username": "user123",
  "date_joined": "2024-01-01T12:00:00Z"
}
```

---

## Posts Endpoints

### List Posts
**GET** `/posts/`

**Query Parameters:**
- `page` (optional): Page number for pagination
- `parent_uuid` (optional): Filter comments by parent post UUID

**Success Response (200):**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/posts/?page=2",
  "previous": null,
  "results": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "content": "This is an anonymous post",
      "topic": 1,
      "parent_uuid": null,
      "timestamp": "2024-01-01T12:00:00Z",
      "views": 42,
      "likes_count": 5,
      "comments_count": 3,
      "avatar_color": "#6366f1",
      "is_comment": false,
      "can_be_deleted_by_user": true,
      "is_liked_by_user": false,
      "is_owned_by_user": true
    }
  ]
}
```

---

### Get Single Post
**GET** `/posts/{uuid}/`

**Success Response (200):**
```json
{
  "uuid": "123e4567-e89b-12d3-a456-426614174000",
  "content": "This is an anonymous post",
  "topic": 1,
  "parent_uuid": null,
  "timestamp": "2024-01-01T12:00:00Z",
  "views": 43,
  "likes_count": 5,
  "comments_count": 3,
  "avatar_color": "#6366f1",
  "is_comment": false,
  "can_be_deleted_by_user": true,
  "is_liked_by_user": false,
  "is_owned_by_user": true,
  "comments": [
    {
      "uuid": "223e4567-e89b-12d3-a456-426614174001",
      "content": "This is a comment",
      "parent_uuid": "123e4567-e89b-12d3-a456-426614174000",
      "timestamp": "2024-01-01T12:05:00Z",
      "views": 10,
      "likes_count": 2,
      "comments_count": 0,
      "avatar_color": "#8b5cf6",
      "is_comment": true,
      "can_be_deleted_by_user": true,
      "is_liked_by_user": false,
      "is_owned_by_user": false
    }
  ]
}
```

---

### Create Post or Comment
**POST** `/posts/`

**Request Body (Post):**
```json
{
  "content": "This is a new anonymous post",
  "topic": 1,  // optional
  "parent_uuid": null
}
```

**Request Body (Comment):**
```json
{
  "content": "This is a comment on a post",
  "parent_uuid": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Success Response (201):**
```json
{
  "uuid": "323e4567-e89b-12d3-a456-426614174002",
  "content": "This is a new anonymous post",
  "topic": 1,
  "parent_uuid": null,
  "timestamp": "2024-01-01T13:00:00Z",
  "views": 0,
  "likes_count": 0,
  "comments_count": 0,
  "avatar_color": "#ec4899",
  "is_comment": false,
  "can_be_deleted_by_user": true,
  "is_liked_by_user": false,
  "is_owned_by_user": true
}
```

**Error Response (400):**
```json
{
  "content": [
    "Content contains prohibited items: URL/link, email address"
  ]
}
```

---

### Delete Post
**DELETE** `/posts/{uuid}/`

**Success Response (204):** No content

**Error Response (403):**
```json
{
  "error": "Posts can only be deleted within 24 hours of creation"
}
```

---

### Like/Unlike Post
**POST** `/posts/{uuid}/like/`

**Success Response (200 - Like):**
```json
{
  "message": "Post liked",
  "likes_count": 6
}
```

**Success Response (200 - Unlike):**
```json
{
  "message": "Post unliked",
  "likes_count": 5
}
```

---

### Get My Posts
**GET** `/posts/my_posts/`

**Success Response (200):**
```json
[
  {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "content": "My anonymous post",
    "topic": 1,
    "parent_uuid": null,
    "timestamp": "2024-01-01T12:00:00Z",
    "views": 42,
    "likes_count": 5,
    "comments_count": 3,
    "avatar_color": "#6366f1",
    "is_comment": false,
    "can_be_deleted_by_user": true,
    "is_liked_by_user": false,
    "is_owned_by_user": true
  }
]
```

---

## Topics Endpoints

### List Topics
**GET** `/topics/`

**Success Response (200):**
```json
[
  {
    "date": "2024-01-01",
    "topic": "What's the best advice you've ever received?",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### Get Today's Topic
**GET** `/topics/today/`

**Success Response (200):**
```json
{
  "date": "2024-01-01",
  "topic": "What's the best advice you've ever received?",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Response (404):**
```json
{
  "message": "No topic for today"
}
```

---

## Moderation Endpoints

### Create Report
**POST** `/moderation/reports/`

**Request Body:**
```json
{
  "post": "123e4567-e89b-12d3-a456-426614174000",
  "reason": "spam",
  "description": "This post contains spam content"  // optional
}
```

**Reason Choices:**
- `spam`
- `harassment`
- `hate_speech`
- `violence`
- `self_harm`
- `other`

**Success Response (201):**
```json
{
  "id": 1,
  "post": "123e4567-e89b-12d3-a456-426614174000",
  "post_details": { /* post object */ },
  "reason": "spam",
  "description": "This post contains spam content",
  "status": "pending",
  "timestamp": "2024-01-01T14:00:00Z"
}
```

**Error Response (400):**
```json
{
  "error": "You have already reported this post"
}
```

---

### Get My Reports
**GET** `/moderation/reports/`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "post": "123e4567-e89b-12d3-a456-426614174000",
    "post_details": { /* post object */ },
    "reason": "spam",
    "description": "This post contains spam content",
    "status": "pending",
    "timestamp": "2024-01-01T14:00:00Z"
  }
]
```

---

### Get Pending Reports (Admin Only)
**GET** `/moderation/reports/pending/`

**Success Response (200):**
```json
[
  {
    "id": 1,
    "post": "123e4567-e89b-12d3-a456-426614174000",
    "post_details": { /* post object */ },
    "reporter_username": "user123",
    "reason": "spam",
    "description": "This post contains spam content",
    "status": "pending",
    "timestamp": "2024-01-01T14:00:00Z",
    "reviewed_at": null,
    "reviewed_by_username": null
  }
]
```

---

### Review Report (Admin Only)
**POST** `/moderation/reports/{id}/review/`

**Request Body:**
```json
{
  "action": "delete_post"  // or "dismiss" or "mark_reviewed"
}
```

**Action Choices:**
- `delete_post`: Delete the reported post and mark report as action_taken
- `dismiss`: Dismiss the report without taking action
- `mark_reviewed`: Mark as reviewed but don't delete post

**Success Response (200):**
```json
{
  "message": "Post deleted and report marked as action taken"
}
```

---

## Rate Limits

- **Anonymous users**: 100 requests/hour
- **Authenticated users**: 1000 requests/hour
- **Post creation**: 10 posts/hour per user
- **Likes**: 100 likes/hour per user

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 429 Too Many Requests
```json
{
  "detail": "Request was throttled. Expected available in X seconds."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

---

## Content Validation Rules

### Prohibited Content
Posts/comments containing the following will be rejected:
- URLs or web links
- Email addresses
- Phone numbers
- Social media handles (e.g., @username)

### Content Length
- Minimum: 1 character (excluding whitespace)
- Maximum: 5000 characters

### Profanity Filtering
Profane words are automatically masked (e.g., "fuck" → "f**k")

---

## WebSocket Support
Currently not implemented. Future versions may include WebSocket support for real-time notifications.
