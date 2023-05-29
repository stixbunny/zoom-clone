import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidV4 } from 'uuid';
const app = express();
const server = createServer(app);
const io = new Server(server);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log(`connecting userId: ${userId} to roomId: ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
    });
});
server.listen(3000);
