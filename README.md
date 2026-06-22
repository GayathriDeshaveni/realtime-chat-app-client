# 💬 Real-time Chat Application

A full-stack real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## 🌐 Live Demo
[https://realtime-chat-app-client-olive.vercel.app](https://realtime-chat-app-client-olive.vercel.app)

## ✨ Features
- 🔐 User registration and login with JWT authentication
- 🔒 Password hashing with bcrypt
- 💬 Real-time messaging with Socket.io
- 🏠 Create public and private chat rooms
- 🔑 Password protected rooms
- ✏️ Edit and delete your own messages
- 🟢 Online users list
- 📜 Message history saved in MongoDB
- 🌙 Dark premium UI

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React | UI Framework |
| Vite | Build Tool |
| Socket.io Client | Real-time communication |
| Axios | API calls |
| React Router DOM | Page navigation |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express | REST API framework |
| Socket.io | Real-time communication |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcrypt | Password hashing |

## 🚀 Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 💻 Run Locally

### Backend Setup
```bash
cd server
npm install
```
Create a `.env` file:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 👩‍💻 Developer
**Gayatri Deshaveni**
- GitHub: [@GayathriDeshaveni](https://github.com/GayathriDeshaveni)