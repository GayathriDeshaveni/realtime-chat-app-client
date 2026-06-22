import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import BASE_URL from '../config'

function Rooms() {
  const [rooms, setRooms] = useState([])
  const [newRoom, setNewRoom] = useState('')
  const [roomPassword, setRoomPassword] = useState('')
  const [joinPasswordInput, setJoinPasswordInput] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    if (!username) navigate('/login')
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const res = await axios.get('${BASE_URL}/api/rooms')
      setRooms(res.data)
    } catch (err) {
      console.error('Failed to fetch rooms')
    }
  }

  const createRoom = async () => {
    if (!newRoom.trim()) return alert('Enter a room name')
    try {
      await axios.post('${BASE_URL}/api/rooms', {
        name: newRoom.trim(),
        username,
        password: roomPassword,
      })
      setNewRoom('')
      setRoomPassword('')
      fetchRooms()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create room')
    }
  }

  const handleJoin = (room) => {
    if (room.hasPassword) {
      setSelectedRoom(room)
    } else {
      navigate(`/chat/${room.name}`)
    }
  }

  const verifyAndJoin = async () => {
    try {
      await axios.post('${BASE_URL}/api/rooms/verify', {
        name: selectedRoom.name,
        password: joinPasswordInput,
      })
      navigate(`/chat/${selectedRoom.name}`)
    } catch (err) {
      alert(err.response?.data?.error || 'Wrong password')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>💬 Chat Rooms</h1>
          <div style={styles.headerRight}>
            <p style={styles.username}>👤 {username}</p>
            <button style={styles.logoutBtn} onClick={logout}>Logout</button>
          </div>
        </div>

        {/* Create Room */}
        <div style={styles.createBox}>
          <input
            style={styles.input}
            type="text"
            placeholder="Room name..."
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Room password (optional)..."
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createRoom()}
          />
          <button style={styles.button} onClick={createRoom}>
            + Create Room
          </button>
        </div>

        {/* Password Popup */}
        {selectedRoom && (
          <div style={styles.popup}>
            <p style={styles.popupTitle}>🔒 Enter password for <span style={styles.purple}>#{selectedRoom.name}</span></p>
            <input
              style={styles.input}
              type="password"
              placeholder="Room password..."
              value={joinPasswordInput}
              onChange={(e) => setJoinPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyAndJoin()}
              autoFocus
            />
            <div style={styles.popupBtns}>
              <button style={styles.button} onClick={verifyAndJoin}>Join →</button>
              <button style={styles.cancelBtn} onClick={() => setSelectedRoom(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Room List */}
        <div style={styles.roomList}>
          {rooms.length === 0 && (
            <p style={styles.empty}>No rooms yet. Create one above!</p>
          )}
          {rooms.map((room) => (
            <div key={room._id} style={styles.roomCard}>
              <span style={styles.roomName}>
                {room.hasPassword ? '🔒' : '#'} {room.name}
              </span>
              <button style={styles.joinBtn} onClick={() => handleJoin(room)}>
                Join →
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f',
    padding: '24px',
  },
  card: {
    background: '#13131a',
    border: '1px solid #2a2a3d',
    borderRadius: '16px',
    padding: '48px',
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
  },
  username: {
    color: '#7c3aed',
    fontSize: '13px',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a3d',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  createBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    background: '#1e1e2e',
    border: '1px solid #2a2a3d',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    background: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  popup: {
    background: '#1e1e2e',
    border: '1px solid #7c3aed',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  popupTitle: {
    color: '#ffffff',
    fontSize: '14px',
  },
  purple: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  popupBtns: {
    display: 'flex',
    gap: '8px',
  },
  cancelBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a3d',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  roomList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  },
  empty: {
    color: '#555',
    fontSize: '14px',
    textAlign: 'center',
    padding: '24px 0',
  },
  roomCard: {
    background: '#1e1e2e',
    border: '1px solid #2a2a3d',
    borderRadius: '10px',
    padding: '14px 18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomName: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: '15px',
  },
  joinBtn: {
    background: 'transparent',
    color: '#7c3aed',
    border: '1px solid #7c3aed',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
  },
}

export default Rooms