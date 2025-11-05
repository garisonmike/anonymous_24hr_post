# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                          │
│                     http://localhost:3000                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend (Port 3000)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │   Components │  │    Pages     │  │   Services (API)    │  │
│  │  - Navbar    │  │  - Home      │  │  - authAPI          │  │
│  │  - PostCard  │  │  - PostDetail│  │  - postsAPI         │  │
│  │  - PostForm  │  │  - MyPosts   │  │  - topicsAPI        │  │
│  │  - TopicBanner│ │  - Login     │  │  - reportsAPI       │  │
│  └──────────────┘  │  - Register  │  └─────────────────────┘  │
│                    │  - AdminDash │                            │
│                    └──────────────┘                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │ (Session Auth + CSRF)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Django Backend (Port 8000)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Django REST Framework                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐   │  │
│  │  │   Users    │  │   Posts    │  │   Moderation     │   │  │
│  │  │  - Login   │  │  - CRUD    │  │  - Reports       │   │  │
│  │  │  - Register│  │  - Likes   │  │  - Admin Review  │   │  │
│  │  │  - Logout  │  │  - Comments│  │                  │   │  │
│  │  └────────────┘  │  - Topics  │  └──────────────────┘   │  │
│  │                  └────────────┘                          │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │           Content Filtering (utils.py)             │ │  │
│  │  │  - Profanity masking                               │ │  │
│  │  │  - URL/Email/Phone detection                       │ │  │
│  │  │  - Handle blocking                                 │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────┬───────────────────────┘
                         │                │
                         │                │
        ┌────────────────┴────┐    ┌──────┴────────┐
        │                     │    │               │
        ▼                     ▼    ▼               │
┌───────────────┐    ┌───────────────────┐         │
│  PostgreSQL   │    │   Redis (6379)    │         │
│   Database    │    │  ┌─────────────┐  │         │
│  ┌─────────┐  │    │  │ Task Queue  │  │         │
│  │ users   │  │    │  │ for Celery  │  │         │
│  │ posts   │  │    │  └─────────────┘  │         │
│  │ likes   │  │    └───────────────────┘         │
│  │ topics  │  │             ▲                     │
│  │ reports │  │             │                     │
│  │ filtered│  │             │                     │
│  │  words  │  │             │                     │
│  └─────────┘  │    ┌────────┴──────────┐         │
└───────────────┘    │   Celery Worker   │         │
                     │  ┌──────────────┐  │         │
                     │  │ Task: Delete │  │◄────────┘
                     │  │  Old Posts   │  │  Scheduled Tasks
                     │  └──────────────┘  │  (via Celery Beat)
                     │  ┌──────────────┐  │
                     │  │ Task: Update │  │
                     │  │   Topics     │  │
                     │  └──────────────┘  │
                     └───────────────────┘
```

## Request Flow Examples

### 1. User Creates a Post

```
User Browser
    │
    │ 1. Submit post form
    ▼
React Frontend
    │
    │ 2. Validate content (client-side)
    │    - Check length
    │    - Check for prohibited content
    ▼
    │ 3. POST /api/posts/
    │    Headers: X-CSRFToken, Cookie (session)
    │    Body: { content, topic, parent_uuid }
    ▼
Django Backend
    │
    │ 4. Authenticate user (session)
    │ 5. Validate CSRF token
    │ 6. Filter content (server-side)
    │    - Mask profanity
    │    - Detect prohibited items
    ▼
    │ 7. Create Post object
    │    - Generate UUID
    │    - Assign random avatar color
    │    - Link to user (hidden)
    │    - Set timestamp
    ▼
PostgreSQL
    │ 8. INSERT INTO posts...
    │
    ▼ 9. Return created post
Django Backend
    │
    ▼ 10. JSON response
React Frontend
    │
    ▼ 11. Update UI with new post
User Browser
```

### 2. Auto-Deletion Process

```
Celery Beat Scheduler
    │
    │ Every hour (crontab)
    ▼
    │ Trigger task: delete_old_posts
    ▼
Celery Worker
    │
    │ 1. Get current time
    │ 2. Calculate time_limit (24 hours ago)
    │ 3. Query: SELECT * FROM posts WHERE timestamp <= time_limit
    ▼
PostgreSQL
    │ Return old posts
    ▼
Celery Worker
    │
    │ 4. DELETE FROM posts WHERE id IN (...)
    │ 5. DELETE FROM likes WHERE post_id IN (...)
    ▼
PostgreSQL
    │ Execute deletions (CASCADE handles related data)
    │
    ▼ Task complete
Celery Worker
```

### 3. User Likes a Post

```
User Browser
    │
    │ 1. Click like button
    ▼
React Frontend
    │
    │ 2. POST /api/posts/{uuid}/like/
    │    Headers: X-CSRFToken, Cookie (session)
    ▼
Django Backend
    │
    │ 3. Check authentication
    │ 4. Rate limit check (100/hour)
    │ 5. Query: Check if Like exists
    ▼
PostgreSQL
    │ 6. SELECT * FROM likes WHERE user_id=X AND post_id=Y
    │
    ▼
Django Backend
    │
    ├─ If like exists:
    │   │ 7a. DELETE FROM likes WHERE id=Z
    │   │
    │   ▼ 8a. Return: "Post unliked"
    │
    └─ If like doesn't exist:
        │ 7b. INSERT INTO likes (user_id, post_id, timestamp)
        │
        ▼ 8b. Return: "Post liked"
Django Backend
    │
    ▼ 9. JSON response with new like count
React Frontend
    │
    ▼ 10. Update UI (toggle heart icon, update count)
User Browser
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                          │
└──────────────┬───────────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
   ┌────────┐      ┌─────────┐
   │ Browse │      │  Auth   │
   │ Posts  │      │ Actions │
   └────┬───┘      └────┬────┘
        │               │
        ▼               ▼
   ┌────────────────────────────┐
   │    React Components        │
   │  - Display posts           │
   │  - Handle user input       │
   │  - Manage local state      │
   └──────────┬─────────────────┘
              │
              ▼
   ┌────────────────────────────┐
   │     API Service (Axios)    │
   │  - Add CSRF token          │
   │  - Include credentials     │
   │  - Handle responses        │
   └──────────┬─────────────────┘
              │
              ▼ HTTP/HTTPS
   ┌────────────────────────────┐
   │   Django REST Framework    │
   │  - Route requests          │
   │  - Authenticate            │
   │  - Validate                │
   │  - Serialize data          │
   └──────────┬─────────────────┘
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
┌──────────┐    ┌──────────────┐
│ Database │    │ Content      │
│ Operations    │ Filtering    │
│ - CRUD   │    │ - Profanity  │
│ - Queries│    │ - Validation │
└──────────┘    └──────────────┘
```

## Security Layer

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: Network Security                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │ - HTTPS (SSL/TLS)                                  │   │
│  │ - CORS policy                                       │   │
│  │ - Firewall rules                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Layer 2: Authentication & Authorization                   │
│  ┌────────────────────────────────────────────────────┐   │
│  │ - Session-based auth                                │   │
│  │ - CSRF protection                                   │   │
│  │ - Password hashing (PBKDF2)                        │   │
│  │ - Permission classes                                │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Layer 3: Rate Limiting                                    │
│  ┌────────────────────────────────────────────────────┐   │
│  │ - Post creation: 10/hour                           │   │
│  │ - Likes: 100/hour                                   │   │
│  │ - API calls: 1000/hour                             │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Layer 4: Input Validation                                 │
│  ┌────────────────────────────────────────────────────┐   │
│  │ - Content filtering                                 │   │
│  │ - Length validation                                 │   │
│  │ - Type checking                                     │   │
│  │ - Sanitization                                      │   │
│  └────────────────────────────────────────────────────┘   │
│                          │                                 │
│                          ▼                                 │
│  Layer 5: Database Security                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │ - Parameterized queries (ORM)                      │   │
│  │ - SQL injection prevention                          │   │
│  │ - User data isolation                               │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Database Entity Relationship

```
┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ username        │
│ password_hash   │
│ email           │
│ date_joined     │
│ is_staff        │
└────────┬────────┘
         │
         │ 1:N (hidden)
         │
         ▼
┌─────────────────┐        ┌─────────────────┐
│      Post       │◄──────│      Like       │
│─────────────────│  1:N  │─────────────────│
│ uuid (PK)       │       │ id (PK)         │
│ user_id (FK)    │       │ user_id (FK)    │
│ content         │       │ post_id (FK)    │
│ topic_id (FK)   │       │ timestamp       │
│ parent_uuid     │       └─────────────────┘
│ timestamp       │              ▲
│ views           │              │
│ avatar_color    │              │ N:1
└────────┬────────┘              │
         │                       │
         │ N:1            ┌──────┴──────┐
         │                │ Unique:     │
         ▼                │ (user, post)│
┌─────────────────┐       └─────────────┘
│      Topic      │
│─────────────────│
│ date (PK)       │
│ topic           │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│  FilteredWord   │
│─────────────────│
│ word (PK)       │
│ replacement     │
│ is_active       │
└─────────────────┘

         ┌─────────────────┐
         │     Report      │
         │─────────────────│
         │ id (PK)         │
         │ post_id (FK)    │─────┐
         │ reporter_id(FK) │     │
         │ reason          │     │ N:1
         │ description     │     │
         │ status          │     ▼
         │ timestamp       │ ┌────────────┐
         │ reviewed_at     │ │    Post    │
         │ reviewed_by(FK) │ │  (above)   │
         └─────────────────┘ └────────────┘
```

## Deployment Architecture (Production)

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (Optional)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Nginx (80/443) │
                    │  - SSL/TLS      │
                    │  - Static files │
                    │  - Reverse proxy│
                    └────────┬────────┘
                             │
            ┌────────────────┴────────────────┐
            │                                 │
            ▼                                 ▼
┌──────────────────────┐          ┌──────────────────────┐
│ React (Static Files) │          │   Django (Gunicorn)  │
│  - Served by Nginx   │          │  - Multiple workers  │
│  - Built with npm    │          │  - Unix socket       │
└──────────────────────┘          └──────────┬───────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    │                   │
                                    ▼                   ▼
                          ┌──────────────┐    ┌──────────────┐
                          │  PostgreSQL  │    │    Redis     │
                          │  - Main DB   │    │ - Task queue │
                          │  - Backups   │    │ - Cache      │
                          └──────────────┘    └──────┬───────┘
                                                     │
                                                     ▼
                                         ┌────────────────────┐
                                         │  Celery Workers    │
                                         │  - Auto-deletion   │
                                         │  - Topic updates   │
                                         └────────────────────┘
                                                     ▲
                                                     │
                                         ┌───────────┴────────┐
                                         │   Celery Beat      │
                                         │   - Scheduler      │
                                         └────────────────────┘
```

## Technology Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
├─────────────────────────────────────────────────────────────┤
│  React 18.2              - UI Framework                     │
│  React Router 6.20       - Client-side routing              │
│  Axios 1.6               - HTTP client                      │
│  date-fns 2.30           - Date formatting                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
├─────────────────────────────────────────────────────────────┤
│  Django 4.2.7            - Web framework                    │
│  DRF 3.14                - REST API                         │
│  Celery 5.3              - Task queue                       │
│  better-profanity 0.7    - Content filtering               │
│  Gunicorn 21.2           - WSGI server                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      INFRASTRUCTURE                         │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 14+          - Primary database                 │
│  Redis 6+                - Task queue & cache               │
│  Nginx                   - Web server (production)          │
│  Systemd                 - Service management               │
│  Let's Encrypt           - SSL certificates                 │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides:
- **Scalability**: Horizontal scaling with multiple Gunicorn workers
- **Reliability**: Automated tasks for data lifecycle management
- **Security**: Multiple layers of protection
- **Performance**: Static file serving, database indexing, caching
- **Maintainability**: Clear separation of concerns, documented APIs
