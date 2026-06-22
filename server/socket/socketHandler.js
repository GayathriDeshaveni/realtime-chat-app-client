const Message = require('../models/Message');

const onlineUsers = {};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 Socket connected: ${socket.id}`);

    // User joins a room
    socket.on('join_room', async ({ username, room }) => {
      socket.join(room);
      socket.data.username = username;
      socket.data.room = room;

      if (!onlineUsers[room]) onlineUsers[room] = new Set();
      onlineUsers[room].add(username);

      // Send last 50 messages
      const history = await Message.find({ room })
        .sort({ timestamp: 1 })
        .limit(50);
      socket.emit('message_history', history);

      // Send updated online users list
      io.to(room).emit('online_users', [...onlineUsers[room]]);

      // Notify others
      socket.to(room).emit('system_message', `${username} joined the room`);
    });

    // User sends a message
    socket.on('send_message', async ({ username, room, text }) => {
      const message = await Message.create({ room, username, text });
      io.to(room).emit('receive_message', message);
    });

    // User edits a message
    socket.on('edit_message', ({ room, message }) => {
      io.to(room).emit('message_edited', message);
    });

    // User deletes a message
    socket.on('delete_message', ({ room, id }) => {
      io.to(room).emit('message_deleted', id);
    });

    // User disconnects
    socket.on('disconnect', () => {
      const { username, room } = socket.data;
      if (room && onlineUsers[room]) {
        onlineUsers[room].delete(username);
        io.to(room).emit('online_users', [...onlineUsers[room]]);
        socket.to(room).emit('system_message', `${username} left the room`);
      }
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
};