# Data Valo System — HTTP API Contract

This document is the binding contract between the Next.js frontend (`frontend/`) and the Node.js Express modular-monolith backend (`backend/`).
Whenever an endpoint is added, modified, or removed, this document must be updated in the same change.

## 1. General Conventions

- **Base URL**: `/api`
- **Transport**: JSON over HTTP/HTTPS (`Content-Type: application/json; charset=utf-8`)
- **Character Encoding**: UTF-8
- **Authentication**: `httpOnly`, `SameSite=Lax`, `Secure` (production) cookie named `dv_admin` containing signed JWT (HS256). Alternatively accepted via `Authorization: Bearer <token>` header for testing.

### Standard Success Response Envelope
```json
{
  "ok": true,
  "data": { ... }
}
```

### Standard Error Response Envelope
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable summary",
    "fields": {
      "fieldName": "Specific field validation message"
    }
  }
}
```
`fields` is optional and present on `400 VALIDATION_ERROR`.

### HTTP Status Codes
- `200 OK`: Successful read or update
- `201 Created`: Successful resource creation
- `400 Bad Request`: Validation failure or malformed payload (code: `VALIDATION_ERROR`, `INVALID_OPERATOR_KEYS`)
- `401 Unauthorized`: Not authenticated or invalid/expired session (code: `UNAUTHORIZED`)
- `403 Forbidden`: Cross-origin violation or state-changing action with mismatched Origin (code: `FORBIDDEN_ORIGIN`)
- `404 Not Found`: Route or resource does not exist (code: `NOT_FOUND`)
- `409 Conflict`: Unique constraint violation e.g. duplicate slug (code: `CONFLICT`)
- `429 Too Many Requests`: Rate limit exceeded (code: `RATE_LIMIT_EXCEEDED`)
- `501 Not Implemented`: Optional service (such as Cloudinary) unconfigured (code: `NOT_IMPLEMENTED`)
- `500 Internal Server Error`: Unhandled server exception (code: `INTERNAL_ERROR`)

---

## 2. Endpoints Inventory

### System & Health

#### `GET /api/health`
Health check and database ping. Pings MongoDB and returns operational status without exposing database URIs or internal host details.
- **Auth**: None
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "status": "up"
    }
  }
  ```

---

### Admin Authentication (`/api/admin/auth`)

#### `POST /api/admin/auth/login`
Authenticates an administrator with timing-attack mitigation and brute-force rate limiting.
- **Auth**: None
- **Rate Limit**: 5 attempts per 15 minutes per IP hash. 6th attempt returns `429 RATE_LIMIT_EXCEEDED`.
- **Request Body**:
  ```json
  {
    "email": "admin@datavalosystem.com",
    "password": "CorrectPassword123!"
  }
  ```
- **Response (200)**:
  Sets `httpOnly`, `SameSite=Lax`, `Path=/` cookie `dv_admin` (8-hour expiry).
  ```json
  {
    "ok": true,
    "data": {
      "id": "6724fa0e21901a1829e59123",
      "email": "admin@datavalosystem.com"
    }
  }
  ```
- **Response (401)** (Generic message for both invalid password and unknown account):
  ```json
  {
    "ok": false,
    "error": {
      "code": "UNAUTHORIZED",
      "message": "Invalid email or password."
    }
  }
  ```

#### `POST /api/admin/auth/logout`
Logs out current administrator and clears `dv_admin` session cookie.
- **Auth**: Admin session required (`401` if missing)
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "message": "Logged out successfully"
    }
  }
  ```

#### `GET /api/admin/auth/me`
Returns details of the currently authenticated administrator.
- **Auth**: Admin session required (`401` if missing/invalid/expired)
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "id": "6724fa0e21901a1829e59123",
      "email": "admin@datavalosystem.com"
    }
  }
  ```

---

### Public Courses (`/api/public/courses`)

#### `GET /api/public/courses`
Lists published courses ordered by `sortOrder` ascending. Draft courses are strictly omitted.
- **Auth**: None
- **Query Parameters**:
  - `category` (optional, string): Filter courses by exact category name.
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": [
      {
        "_id": "6724fa0e21901a1829e59124",
        "code": "SN-101",
        "title": "ServiceNow Fundamentals",
        "slug": "servicenow-fundamentals",
        "shortDescription": "Master the platform used by 85% of Fortune 500 companies.",
        "category": "ITSM",
        "tools": ["ServiceNow", "ITSM"],
        "level": "beginner",
        "mode": "online",
        "duration": "6 weeks",
        "status": "published",
        "featured": true,
        "sortOrder": 1
      }
    ]
  }
  ```

#### `GET /api/public/courses/:slug`
Fetches a single published course by its URL slug.
- **Auth**: None
- **Response (200)**: Course object with full syllabus.
- **Response (404)**: If course does not exist or has `status: "draft"`.
  ```json
  {
    "ok": false,
    "error": {
      "code": "NOT_FOUND",
      "message": "Course with slug '...' was not found"
    }
  }
  ```

---

### Admin Courses (`/api/admin/courses`)

All endpoints in this section require an active admin session (`401 UNAUTHORIZED` if missing).

#### `GET /api/admin/courses`
Lists all courses (both draft and published) with search, filter, and pagination.
- **Query Parameters**:
  - `q` (optional): Case-insensitive search on title, code, or short description.
  - `status` (optional): `'draft'` | `'published'`.
  - `page` (optional, default: `1`): Page number.
  - `limit` (optional, default: `20`): Items per page (max `100`).
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": [ ... ],
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 45,
        "totalPages": 3,
        "hasNext": true,
        "hasPrev": false
      }
    }
  }
  ```

#### `POST /api/admin/courses`
Creates a new course. Emits `course.changed` on write.
- **Request Body**:
  ```json
  {
    "title": "ServiceNow Fundamentals",
    "slug": "servicenow-fundamentals",
    "shortDescription": "Master the platform used by 85% of Fortune 500 companies.",
    "code": "SN-101",
    "overview": "Platform architecture, navigation, incident management...",
    "syllabus": [
      {
        "title": "Navigation & UI",
        "topics": ["Lists", "Breadcrumbs", "Filters"]
      }
    ],
    "category": "ITSM",
    "tools": ["ServiceNow"],
    "level": "beginner",
    "mode": "online",
    "duration": "6 weeks",
    "audience": "College students (2nd to 4th year)",
    "fee": 15000,
    "status": "draft",
    "featured": false,
    "sortOrder": 0
  }
  ```
- **Response (201 Created)**: Created course document.
- **Response (409 Conflict)**: If `slug` is already in use (`code: "CONFLICT"`).

#### `GET /api/admin/courses/:id`
Retrieves a single course by its MongoDB `_id`.
- **Response (200)**: Course document.
- **Response (404)**: If not found.

#### `PUT /api/admin/courses/:id`
Updates course fields. If thumbnail is replaced or removed, triggers deletion of old thumbnail. Emits `course.changed`.
- **Response (200)**: Updated course document.
- **Response (409 Conflict)**: If new slug conflicts with another course.

#### `PATCH /api/admin/courses/:id/status`
Toggles status between `'draft'` and `'published'`. Emits `course.changed`.
- **Request Body**:
  ```json
  {
    "status": "published"
  }
  ```
- **Response (200)**: Updated course document.

#### `POST /api/admin/courses/reorder`
Updates `sortOrder` for multiple courses in a single atomic `bulkWrite`. Emits `course.changed`.
- **Request Body**:
  ```json
  {
    "items": [
      { "id": "6724fa0e21901a1829e59124", "sortOrder": 1 },
      { "id": "6724fa0e21901a1829e59125", "sortOrder": 2 }
    ]
  }
  ```
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "reordered": true,
      "count": 2
    }
  }
  ```

#### `DELETE /api/admin/courses/:id`
Permanently deletes course and cleans up associated thumbnail image. Emits `course.changed`.
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "deleted": true,
      "id": "6724fa0e21901a1829e59124"
    }
  }
  ```

---

### Uploads (`/api/admin/uploads`)

#### `POST /api/admin/uploads/sign`
Generates cryptographically signed upload parameters for direct client-to-Cloudinary image uploads.
- **Auth**: Admin session required (`401` if missing)
- **Constraints**: Formats restricted to JPG, PNG, WebP; max size 2 MB (`2097152` bytes).
- **Response (200)** (when Cloudinary credentials configured):
  ```json
  {
    "ok": true,
    "data": {
      "timestamp": 1730937600,
      "signature": "3c8477d4c2b9a117b43c...",
      "apiKey": "1234567890",
      "cloudName": "datavalo",
      "folder": "datavalo/courses",
      "allowedFormats": ["jpg", "png", "webp"],
      "maxFileSize": 2097152
    }
  }
  ```
- **Response (501 Not Implemented)** (when Cloudinary unconfigured):
  ```json
  {
    "ok": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "Image upload service is not configured on this server."
    }
  }
  ```

---

### Site Settings (`/api/public/settings` & `/api/admin/settings`)

#### `GET /api/public/settings`
Returns public popup and contact configuration. Never leaks internal database identifiers.
- **Auth**: None
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "popupEnabled": true,
      "popupDelaySeconds": 8,
      "popupScrollPercent": 40,
      "popupReappearSeconds": 120,
      "popupMaxDismissals": 5,
      "contactEmail": "info@datavalosystem.com",
      "contactPhone": "+91 98765 43210",
      "instagramUrl": "https://instagram.com/datavalosystem",
      "linkedinUrl": "https://linkedin.com/company/datavalo"
    }
  }
  ```

#### `GET /api/admin/settings`
Retrieves full settings singleton document (`key: 'main'`).
- **Auth**: Admin session required (`401` if missing)
- **Response (200)**: Full settings object.

#### `PUT /api/admin/settings`
Updates site configuration with range and type validation. Emits `settings.changed`.
- **Auth**: Admin session required (`401` if missing)
- **Request Body**:
  ```json
  {
    "popupEnabled": true,
    "popupDelaySeconds": 10,
    "popupScrollPercent": 45,
    "popupReappearSeconds": 180,
    "popupMaxDismissals": 4,
    "contactEmail": "contact@datavalosystem.com",
    "contactPhone": "+91 98765 43210",
    "instagramUrl": "https://instagram.com/datavalosystem",
    "linkedinUrl": "https://linkedin.com/company/datavalosystem"
  }
  ```
- **Response (200)**: Updated settings object.
- **Response (400)**: If any parameter is out of valid range (e.g. `popupDelaySeconds > 120`).

---

### Public Student Leads (`/api/public/leads`)

#### `POST /api/public/leads`
Submits a student lead registration from either the quick popup or full contact page form.
- **Auth**: None
- **Rate Limit**: 10 submissions per 1 hour per IP hash (`HMAC-SHA256`). 11th request returns `429 RATE_LIMIT_EXCEEDED`. Raw IP is never stored.
- **Spam Defense**: Honeypot field `_hp`. If populated, the server silently returns HTTP 200 `{ ok: true }` and discards the payload without writing to the database or emitting events.
- **Deduplication**: If an existing lead matches by `email` or `phone`, the record is updated, optional fields are populated, and new course IDs are merged via `$addToSet`.
- **Request Body**:
  ```json
  {
    "fullName": "Aarav Sharma",
    "phone": "9876543210",
    "email": "aarav@college.edu",
    "college": "IIT (BHU) Varanasi",
    "courseYear": "B.Tech CSE, 3rd year",
    "interestedCourseIds": ["6724fa0e21901a1829e59124"],
    "consent": true,
    "city": "Varanasi",
    "preferredMode": "Online",
    "skillLevel": "Beginner",
    "heardFrom": "College event",
    "source": "iit-bhu",
    "pagePath": "/courses/servicenow-fundamentals",
    "deviceType": "desktop",
    "formVariant": "contact",
    "_hp": ""
  }
  ```
- **Response (200)**:
  ```json
  {
    "ok": true
  }
  ```
- **Response (400)**: If required fields are missing, phone is not 10 digits starting with 6-9, consent is not `true`, or none of the submitted courses are published.
- **Response (403)**: If submitted from a foreign origin.
- **Response (429)**: If more than 10 requests are received from the same IP hash within 1 hour.

---

### Public Campus Requests (`/api/public/campus-requests`)

#### `POST /api/public/campus-requests`
Submits an institutional workshop or campus recruitment request from colleges and universities.
- **Auth**: None
- **Rate Limit**: 10 submissions per 1 hour per IP hash. 11th request returns `429 RATE_LIMIT_EXCEEDED`. Raw IP is never stored.
- **Spam Defense**: Honeypot field `_hp`. If populated, silently returns HTTP 200 `{ ok: true }` without writing to the database.
- **Request Body**:
  ```json
  {
    "institution": "IIT (BHU) Varanasi",
    "contactPerson": "Dr. S. K. Singh",
    "designation": "Head of Training & Placement Cell",
    "email": "tpo@iitbhu.ac.in",
    "phone": "9876543210",
    "approxStudents": 150,
    "preferredFormat": "on-campus",
    "message": "Interested in a 2-day ServiceNow workshop for engineering students.",
    "consent": true,
    "source": "campus-drive",
    "pagePath": "/colleges",
    "deviceType": "desktop",
    "_hp": ""
  }
  ```
- **Response (200)**:
  ```json
  {
    "ok": true
  }
  ```
- **Response (400)**: If required fields are missing, invalid email/phone, or consent is false.
- **Response (403)**: If submitted from a foreign origin.
- **Response (429)**: If rate limit exceeded.

---

### Admin Leads Management (`/api/admin/leads`)

#### `GET /api/admin/leads`
Lists student leads with pagination, full-text search, and multi-parameter filtering.
- **Auth**: Required (`dv_admin` cookie)
- **Query Parameters**:
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 25, max: 100)
  - `search`: String (escaped regex search over `fullName`, `email`, `phone`, `college`)
  - `college`: String (case-insensitive substring filter)
  - `source`: String (exact campaign source tag match, e.g. `qr-iit-delhi`)
  - `courseId`: String (course ObjectId)
  - `formVariant`: String (`popup` | `contact`)
  - `startDate`: ISO 8601 date string
  - `endDate`: ISO 8601 date string
  - `sort`: String (e.g. `-createdAt`, `createdAt`, default: `-createdAt`)
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "items": [
        {
          "_id": "6724fa0e21901a1829e59999",
          "fullName": "Aarav Sharma",
          "email": "aarav@iitbhu.ac.in",
          "phone": "9876543210",
          "college": "IIT (BHU) Varanasi",
          "courseYear": "B.Tech CSE, 3rd year",
          "interestedCourseIds": ["6724fa0e21901a1829e59111"],
          "courses": [
            {
              "id": "6724fa0e21901a1829e59111",
              "title": "ServiceNow Fundamentals"
            }
          ],
          "consent": true,
          "consentAt": "2026-11-06T10:00:00.000Z",
          "source": "iit-bhu",
          "formVariant": "popup",
          "createdAt": "2026-11-06T10:00:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 25,
      "totalPages": 1
    }
  }
  ```

#### `GET /api/admin/leads/export`
Exports matching student leads as a CSV file.
- **Auth**: Required (`dv_admin` cookie)
- **Query Parameters**: Same filter parameters as `GET /api/admin/leads`
- **Security**: UTF-8 BOM (`\uFEFF`) included; formula injection defense applied (cells starting with `=`, `+`, `-`, `@`, `\t`, `\r` are prefixed with `'`).
- **Response (200)**: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="leads-YYYY-MM-DD.csv"`

#### `GET /api/admin/leads/:id`
Retrieves full details of a single lead, including mapped interested course titles.
- **Auth**: Required (`dv_admin` cookie)
- **Response (200)**: `{ "ok": true, "data": { ...lead, "courses": [...] } }`
- **Response (404)**: If lead ID is not found.

#### `DELETE /api/admin/leads/:id`
Permanently deletes a student lead.
- **Auth**: Required (`dv_admin` cookie)
- **Response (200)**: `{ "ok": true, "data": { "deleted": true, "id": "..." } }`
- **Response (404)**: If lead ID is not found.

---

### Admin Campus Requests (`/api/admin/campus-requests`)

#### `GET /api/admin/campus-requests`
Lists institutional campus workshop requests with pagination and search.
- **Auth**: Required (`dv_admin` cookie)
- **Query Parameters**:
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 25, max: 100)
  - `search`: String (escaped regex search over `institution`, `contactPerson`, `email`, `phone`, `designation`)
  - `preferredFormat`: String
  - `startDate`: ISO 8601 date string
  - `endDate`: ISO 8601 date string
  - `sort`: String (default: `-createdAt`)
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "items": [
        {
          "_id": "6724fa0e21901a1829e59888",
          "institution": "IIT (BHU) Varanasi",
          "contactPerson": "Dr. S. K. Singh",
          "designation": "Head of TPO",
          "email": "tpo@iitbhu.ac.in",
          "phone": "9876543210",
          "approxStudents": 150,
          "preferredFormat": "on-campus",
          "message": "2-day workshop inquiry",
          "consent": true,
          "createdAt": "2026-11-06T11:00:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "limit": 25,
      "totalPages": 1
    }
  }
  ```

#### `GET /api/admin/campus-requests/export`
Exports institutional requests as a CSV file with formula-injection neutralization and UTF-8 BOM.
- **Auth**: Required (`dv_admin` cookie)
- **Response (200)**: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="campus-requests-YYYY-MM-DD.csv"`

#### `GET /api/admin/campus-requests/:id`
Retrieves a single campus request.
- **Auth**: Required (`dv_admin` cookie)
- **Response (200)**: `{ "ok": true, "data": { ...campusRequest } }`
- **Response (404)**: If request ID is not found.

#### `DELETE /api/admin/campus-requests/:id`
Deletes a campus workshop request.
- **Auth**: Required (`dv_admin` cookie)
- **Response (200)**: `{ "ok": true, "data": { "deleted": true, "id": "..." } }`

---

### Admin Dashboard Overview (`/api/admin/overview`)

#### `GET /api/admin/overview`
Retrieves aggregated statistics and operational insights for the admin dashboard.
- **Auth**: Required (`dv_admin` cookie)
- **Response (200)**:
  ```json
  {
    "ok": true,
    "data": {
      "totalLeads": 42,
      "leadsLast7Days": 15,
      "publishedCoursesCount": 8,
      "campusRequestCount": 4,
      "topSources": [
        { "source": "qr-iit-bhu", "count": 18 },
        { "source": "linkedin", "count": 12 }
      ],
      "topCourses": [
        {
          "courseId": "6724fa0e21901a1829e59111",
          "title": "ServiceNow Fundamentals",
          "count": 22
        }
      ],
      "latestLeads": [ ... ]
    }
  }
  ```

---

### Internal Cache Revalidation Dispatcher

Triggered automatically via in-process events (`course.changed`, `settings.changed`).
- **Target URL**: `${FRONTEND_REVALIDATE_URL}`
- **Headers**:
  - `Content-Type: application/json`
  - `x-revalidate-secret: ${REVALIDATE_SECRET}`
- **Payload**:
  ```json
  {
    "tags": ["courses"]
  }
  ```
- **Resilience**: 3-second timeout (`AbortSignal.timeout(3000)`), 1 automatic retry on failure, errors logged only (never interrupts caller's request).
