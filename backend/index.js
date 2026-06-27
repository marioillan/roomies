import cookieParser from 'cookie-parser';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';
import perfilRoutes from './routes/perfil.js';
import gruposRoutes from './routes/grupos.js';
import publicacionesRoutes from './routes/publicaciones.js';
import favoritosRoutes from './routes/favoritos.js';
import chatsRoutes from './routes/chats.js'
import compraRoutes from './routes/compra.js';
import facturasRoutes from './routes/facturas.js';
import tareasRoutes from './routes/tareas.js';
import { prisma } from './src/config/db.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});

// Verify JWT from cookie on socket connection
io.use((socket, next) => {
  const rawCookie = socket.handshake.headers.cookie ?? '';
  const cookies = parse(rawCookie);
  const token = cookies.token;
  if (!token) return next(new Error('No autenticado'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId ?? payload.id;
    next();
  } catch {
    next(new Error('Token inválido'));
  }
});

io.on('connection', (socket) => {
  // Client joins a chat room after verifying access
  socket.on('join_chat', async (chatId) => {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        solicitud: {
          OR: [
            { usuario_id: socket.userId },
            { grupo: { miembros: { some: { usuario_id: socket.userId, activo: true } } } },
          ],
        },
      },
      select: { id: true },
    });
    if (chat) socket.join(`chat:${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat:${chatId}`);
  });
});

// Attach io to app so routes can emit events
app.set('io', io);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/favoritos', favoritosRoutes);
app.use('/api/chats', chatsRoutes)
app.use('/api/compra', compraRoutes);
app.use('/api/facturas', facturasRoutes);
app.use('/api/tareas', tareasRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

export default app;
