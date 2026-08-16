# TalkStream

TalkStream is a full-stack real-time chat application consisting of a React frontend and a TypeScript backend (Node.js + Express). The app uses MongoDB with Mongoose for persistence, Socket.IO for real-time messaging and presence, and Cloudinary for media storage.

**This README documents the current implementation and developer workflow for both the client and server.**

## Contents
- Overview
- Features
- Architecture
- Project Structure
- Frontend
- Backend (TypeScript)
- API Endpoints
- Socket.IO Events
- Environment Variables
- Install & Run
- Development
- Testing & Linting
- Security
- Scalability & Future Improvements
- Contributing

## Overview
TalkStream provides one-to-one conversations with text and media messaging, message delivery/read tracking, typing indicators, presence (online users), optimistic file uploads, and basic user management (signup/login).

## Features (implemented)
- JWT authentication (signup/login)
- One-to-one conversations with last message and unread counts
- Real-time messaging via Socket.IO
- Typing indicators, delivery and seen notifications
- Message edit & delete
- File uploads via Cloudinary (handled server-side with Multer memory storage)
- Pagination for message history

## Architecture (high level)

User → React Client
  ├─ REST API → TypeScript / Express Backend → MongoDB (Mongoose)
  └─ Socket.IO ↔ Socket server (attached to Express) → MongoDB
  Backend → Cloudinary (media storage)

## Project Structure (root)

real-time-chat/
├── client/                 # React app (JavaScript)
│   ├── src/
│   │   ├── socket/         # Socket.IO client init
│   │   ├── store/          # Zustand stores (auth, chat)
│   │   └── ...
├── server/                 # TypeScript backend
│   ├── src/
│   │   ├── config/         # env, db, cloudinary
│   │   ├── controllers/
│   │   ├── enums/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/         # Socket.IO server logic
│   │   ├── types/
│   │   ├── app.ts
│   │   └── server.ts
├── README.md               # ← this file

## Frontend (client)
- Framework: React (Create React App)
- State: Zustand (`client/src/store/authStore.js`, `client/src/store/chatStore.js`)
- Socket client: `client/src/socket/socketClient.js` — connects using JWT via query `token`
- Config: `client/src/config.js` uses `REACT_APP_API_URL` and `REACT_APP_SOCKET_URL`
- Key behavior:
  - Socket events update Zustand stores (messages, conversations, online users, typing state)
  - File uploads are performed by POSTing `multipart/form-data` to `/api/upload` then the uploaded file metadata is sent over socket with `tempId` support for optimistic UI

Client npm scripts (client/package.json):
 - `npm start` — start dev server
 - `npm build` — build production bundle
 - `npm test` — run tests

## Backend (server) — TypeScript
- Runtime: Node.js
- Framework: Express
- Real-time: Socket.IO (server in `server/src/socket/socket.ts`)
- Database: MongoDB via Mongoose
- Validation: `express-validator` + `zod` for env validation
- File uploads: `multer` (memory storage) + Cloudinary stream upload

Server npm scripts (server/package.json):
 - `npm run dev` — run with `ts-node-dev` for development
 - `npm run build` — compile TypeScript to `dist/`
 - `npm start` — run compiled `dist/server.js`
 - `npm run lint`, `npm run format` — code quality commands

### TypeScript usage & patterns
- `src/types/` contains request and socket types used across server code
- Controllers are thin and call services in `src/services/` for business logic
- Mongoose models are typed with interfaces (e.g., `User`, `Message`, `Conversation`)
- Environment variables are validated and exported from `src/config/env.ts` using `zod`

## API Endpoints (summary)

Base path: `/api`

User routes — `server/src/routes/user.routes.ts`:
- `POST /api/user/signup` — register (body: `name`, `email`, `password`)
- `POST /api/user/login` — login (body: `email`, `password`)
- `GET /api/user` — list users (requires `Authorization: Bearer <token>`)

Conversation routes — `server/src/routes/conversation.routes.ts`:
- `GET /api/conversations` — get conversations for authenticated user
- `POST /api/conversations/start` — start or reuse a conversation (body: `receiverId`)

Message routes — `server/src/routes/message.routes.ts`:
- `GET /api/messages/:conversationId?page=&limit=` — fetch messages (pagination)
- `POST /api/messages/storeMessage` — store message (used by server-side flow when not via socket)
- `PUT /api/messages/read/:conversationId` — mark messages as read (also supported via socket)

Upload route — `server/src/routes/upload-file.routes.ts`:
- `POST /api/upload` — single file upload (`form-data` field `file`) — requires auth; server uploads to Cloudinary and returns `{ url, name, size, type }`

### Authentication
- JWT tokens are issued by `src/services/auth.service.ts` and signed with `JWT_SECRET`.
- Protected routes use `server/src/middleware/auth.middleware.ts` that expects `Authorization: Bearer <token>`.

## Socket.IO events (server-side behavior)

Client emits (server listens):
- `joinConversation` (conversationId) — server checks membership and joins socket to room
- `leaveConversation` (conversationId)
- `sendMessage` (data: `{ conversationId, content?, messageType?, file?, tempId? }`) — server stores message and emits `receiveMessage` to the conversation room
- `markAsRead` ({ conversationId }) — marks messages seen and emits `messagesSeen` / `messagesRead` as appropriate
- `typing` / `stopTyping` ({ conversationId }) — server broadcasts `userTyping` / `userStopTyping` to room
- `editMessage` ({ messageId, content }) — allows sender to edit message and emits `messageEdited`
- `deleteMessage` ({ messageId }) — allows sender to delete message, removes file from Cloudinary when applicable, emits `messageDeleted`

Server emits (client listens):
- `receiveMessage` — when a new message is created (includes `tempId` echo for optimistic UI replacement)
- `onlineUsers` — list of currently online user IDs
- `messagesDelivered` — emitted when undelivered messages are marked delivered (on connect)
- `messagesSeen` — when recipient marks messages as read
- `messageEdited`, `messageDeleted` — message lifecycle updates

### Socket authentication
- Client connects using `token` as a query parameter. Server uses `verifyToken` and attaches `user` to the socket. Unauthorized sockets are rejected.

## Environment Variables (required by server)
The server validates these at startup via `src/config/env.ts` (zod schema). Provide values in a `.env` file in `server/`.

- `PORT` (default: `5000`)
- `MONGO_URI` (required)
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (default: `7d`)
- `CLIENT_URL` (required; used for Socket.IO CORS)
- `API_BASE_URL` (optional)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (required for uploads)
- `UPLOAD_PRESET` (required by env schema)

Frontend env (optional, in client `.env`):
- `REACT_APP_API_URL` (e.g., `http://localhost:5000/api`)
- `REACT_APP_SOCKET_URL` (e.g., `http://localhost:5000`)

## Install & Run (local development)

1) Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

2) Server environment

Create `server/.env` with the required variables listed above (placeholders are fine for local MongoDB and Cloudinary when testing without uploads).

3) Run servers

Server (development, restarts on change):

```bash
cd server
npm run dev
```

Client (development):

```bash
cd client
npm start
```

Production build

```bash
cd server
npm run build
npm start

cd client
npm run build
```

## Testing & Linting
- Frontend tests: `cd client && npm test` (Create React App test runner)
- Backend: no automated tests available in the repository (server/package.json `test` prints a placeholder)
- Lint/format: `cd server && npm run lint` / `npm run format`

## Security (implemented)
- JWT authentication with `Authorization: Bearer <token>` header
- Password hashing using `bcryptjs` in `User` model pre-save hook
- Validation with `express-validator` for routes
- File upload size limit (20 MB) and MIME allowlist enforced in upload route
- CORS configured for `CLIENT_URL` in Socket.IO

## Scalability & Future Improvements
- Currently implemented: stateless API, Mongoose persistence, room-based Socket.IO model
- Recommended improvements (not implemented):
  - Add Redis adapter for Socket.IO for multi-instance horizontal scaling
  - Add background processing (worker queue) for heavy media tasks
  - Add centralized logging/observability

## Contributing
- Follow existing code style (Prettier + ESLint). Run `npm run lint` and `npm run format` in `server/` before PRs.
- Open issues for bugs or feature requests and create focused PRs.

## License
This repository does not contain a license file. Add a `LICENSE` if you intend to open-source the project.

---

If you want, I can add an `.env.example` snippet, run TypeScript compilation, or expand the README with deployment instructions.
