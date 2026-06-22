import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import BASE_URL from '../config'

const socket = io(BASE_URL)
function Chat() {
  const { roomName } = useParams()
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!username) navigate('/')

    socket.emit('join_room', { username, room: roomName })

    socket.on('message_history', (history) => {
      setMessages(history)
    })

    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on('message_edited', (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m))
      )
    })

    socket.on('message_deleted', (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id))
    })

    socket.on('online_users', (users) => {
      setOnlineUsers(users)
    })

    socket.on('system_message', (msg) => {
      setMessages((prev) => [...prev, { system: true, text: msg }])
    })

    return () => {
      socket.off('message_history')
      socket.off('receive_message')
      socket.off('message_edited')
      socket.off('message_deleted')
      socket.off('online_users')
      socket.off('system_message')
    }
  }, [roomName])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!text.trim()) return
    socket.emit('send_message', { username, room: roomName, text })
    setText('')
  }

  const startEdit = (msg) => {
    setEditingId(msg._id)
    setEditText(msg.text)
  }

  const saveEdit = async (id) => {
    try {
      const res = await axios.put(`${BASE_URL}/api/messages/${id}`, {
        text: editText,
        username,
      })
      socket.emit('edit_message', { room: roomName, message: res.data })
      setEditingId(null)
      setEditText('')
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to edit')
    }
  }

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return
    try {
      await axios.delete(`${BASE_URL}/api/messages/${id}`, {
        data: { username },
      })
      socket.emit('delete_message', { room: roomName, id })
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>💬 ChatApp</h2>
        <p style={styles.roomLabel}>#{roomName}</p>
        <div style={styles.divider} />
        <p style={styles.onlineTitle}>🟢 Online</p>
        {onlineUsers.map((user, i) => (
          <p key={i} style={styles.onlineUser}>• {user}</p>
        ))}
        <button style={styles.leaveBtn} onClick={() => navigate('/rooms')}>
          ← Leave Room
        </button>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        <div style={styles.messages}>
          {messages.map((msg, i) =>
            msg.system ? (
              <p key={i} style={styles.systemMsg}>— {msg.text} —</p>
            ) : (
              <div
                key={i}
                style={{
                  ...styles.message,
                  alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.username !== username && (
                  <p style={styles.msgUsername}>{msg.username}</p>
                )}

                {/* Edit mode */}
                {editingId === msg._id ? (
                  <div style={styles.editRow}>
                    <input
                      style={styles.editInput}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(msg._id)}
                      autoFocus
                    />
                    <button style={styles.saveBtn} onClick={() => saveEdit(msg._id)}>
                      Save
                    </button>
                    <button style={styles.cancelBtn} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      ...styles.bubble,
                      background: msg.username === username ? '#7c3aed' : '#1e1e2e',
                    }}
                  >
                    {msg.text}
                    {msg.edited && (
                      <span style={styles.editedTag}> (edited)</span>
                    )}
                  </div>
                )}

                <div style={styles.metaRow}>
                  <p style={styles.time}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {/* Only show edit/delete for own messages */}
                  {msg.username === username && !editingId && (
                    <div style={styles.actions}>
                      <button
                        style={styles.editBtn}
                        onClick={() => startEdit(msg)}
                      >
                        ✏️
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteMessage(msg._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            placeholder={`Message #${roomName}...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button style={styles.sendBtn} onClick={sendMessage}>
            Send →
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#0a0a0f',
  },
  sidebar: {
    width: '220px',
    background: '#13131a',
    borderRight: '1px solid #2a2a3d',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  logo: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
  },
  roomLabel: {
    color: '#7c3aed',
    fontWeight: '600',
    fontSize: '15px',
  },
  divider: {
    height: '1px',
    background: '#2a2a3d',
    margin: '4px 0',
  },
  onlineTitle: {
    color: '#888',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  onlineUser: {
    color: '#ccc',
    fontSize: '14px',
  },
  leaveBtn: {
    marginTop: 'auto',
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a3d',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  systemMsg: {
    color: '#555',
    fontSize: '12px',
    textAlign: 'center',
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '60%',
    gap: '4px',
  },
  msgUsername: {
    color: '#7c3aed',
    fontSize: '12px',
    fontWeight: '600',
  },
  bubble: {
    padding: '10px 14px',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  editedTag: {
    fontSize: '11px',
    color: '#aaa',
    fontStyle: 'italic',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  time: {
    color: '#555',
    fontSize: '11px',
  },
  actions: {
    display: 'flex',
    gap: '4px',
  },
  editBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '2px',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '2px',
  },
  editRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    background: '#1e1e2e',
    border: '1px solid #7c3aed',
    borderRadius: '6px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  saveBtn: {
    background: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  cancelBtn: {
    background: 'transparent',
    color: '#888',
    border: '1px solid #2a2a3d',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    borderTop: '1px solid #2a2a3d',
    background: '#13131a',
  },
  input: {
    flex: 1,
    background: '#1e1e2e',
    border: '1px solid #2a2a3d',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    background: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}

export default Chat