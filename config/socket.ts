import { Server, Socket } from 'socket.io';
import http from 'http';
import Message from '../models/message';
import Profile from '../models/profiles';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export default function setupSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      if (typeof decoded === 'object' && decoded !== null) {
        const user = await User.findById(decoded._id);
        if (!user) return next(new Error('Authentication error'));
        (socket as any).user = user;
        next();
      } else {
        next(new Error('Authentication error'));
      }
    } catch (e) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    socket.join(user._id.toString());

    socket.on('send_message', async ({ receiverId, content }: { receiverId: string; content: string }) => {

      const senderProfile = await Profile.findOne({ user: user._id });
      if (!senderProfile || !senderProfile.matches.includes(receiverId as any)) {
        socket.emit('error', 'You can only message matched users.');
        return;
      }
      const message = new Message({ sender: user._id, receiver: receiverId, content });
      await message.save();
      io.to(receiverId).emit('receive_message', {
        senderId: user._id,
        content,
        timestamp: message.timestamp
      });
      socket.emit('message_sent', { receiverId, content, timestamp: message.timestamp });
    });
  });

  return io;
}
