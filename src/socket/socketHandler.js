import { io } from './app.js';

const emailSocketMap = new Map();

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id} with email ${socket.email}`);

    const email = socket.email;

    emailSocketMap.set(email, socket.id);

    //Socket disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        emailSocketMap.delete(email);
    });

});

export { emailSocketMap }