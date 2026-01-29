# Task 01: Foundation Setup

## Objective
Set up the basic Docker environment and project structure for both frontend and backend.

## Prerequisites
- Docker and Docker Compose installed
- Basic project directory created

## Steps

### 1. Create Docker Configuration
- [ ] Create `docker-compose.yml` with frontend (nginx) and backend (Node.js) services
- [ ] Create `frontend/Dockerfile` (use nginx:alpine)
- [ ] Create `backend/Dockerfile` (use node:alpine with TypeScript)
- [ ] Create `frontend/nginx.conf` for serving static files and proxying API calls

### 2. Backend Skeleton
- [ ] Initialize backend with `package.json` (Express, TypeScript, dotenv, multer for file uploads)
- [ ] Create `backend/src/server.ts` - Basic Express server
- [ ] Create folder structure:
  - `backend/src/routes/` (for API routes)
  - `backend/src/providers/` (for provider implementations)
  - `backend/src/providers/interfaces/` (for provider interfaces)
  - `backend/src/config/` (for configuration files)
  - `backend/temp/` (for temporary audio files)
- [ ] Add basic middleware (cors, body-parser, static file serving for audio)
- [ ] Add basic error handling middleware

### 3. Frontend Skeleton (Vanilla JS)
- [ ] Create `frontend/index.html` with two-tab structure
  - Tab navigation buttons
  - Playground tab container
  - Chat agent tab container
- [ ] Create `frontend/css/styles.css` - Basic styling for layout
- [ ] Create `frontend/js/` folder with:
  - `api.js` - Fetch wrapper for backend API calls
  - `audio.js` - Audio recording and playback utilities
  - `ui.js` - DOM manipulation helpers
  - `app.js` - Main application logic (tab switching, init)

### 4. Environment Configuration
- [ ] Create `.env.example` with placeholder keys:
  ```
  NODE_ENV=development
  BACKEND_PORT=3001
  FRONTEND_PORT=3000

  # API Keys (add as needed)
  OPENROUTER_API_KEY=
  OPENAI_API_KEY=
  ```
- [ ] Create `.gitignore` (ignore node_modules, .env, temp/)

### 5. Basic Connectivity Test
- [ ] Add a test endpoint in backend: `GET /api/health` → returns `{ status: 'ok' }`
- [ ] In frontend `api.js`, add function to call health endpoint
- [ ] In frontend `app.js`, call health endpoint on page load and console.log result

## Testing Requirements

**⚠️ CRITICAL: Must test before marking complete:**

1. **Docker builds successfully:**
   ```bash
   docker-compose build
   ```

2. **Docker starts both services:**
   ```bash
   docker-compose up
   ```

3. **Frontend accessible:**
   - Open `http://localhost:3000`
   - Should see basic HTML page with two tab buttons

4. **Backend accessible:**
   - API health check works: `http://localhost:3001/api/health`
   - Should return `{ status: 'ok' }`

5. **Frontend-Backend communication:**
   - Open browser console
   - Should see successful health check logged
   - No CORS errors

6. **Tab switching works:**
   - Click tab buttons
   - Should show/hide tab content

## Acceptance Criteria
- ✅ Docker Compose starts both containers without errors
- ✅ Frontend loads at `http://localhost:3000`
- ✅ Backend responds at `http://localhost:3001/api/health`
- ✅ No CORS errors in browser console
- ✅ Basic tab navigation works in UI
- ✅ Clean folder structure for future development

## Deliverables
- Working Docker setup
- Basic Express server
- Basic HTML/CSS/JS frontend
- Health check endpoint working
- All files committed and organized

## Notes
- Keep it simple - no fancy features yet
- Focus on getting the infrastructure working
- No provider implementations yet - just the skeleton
- Make sure hot reload works (volumes in docker-compose)
