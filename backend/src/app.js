const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { verifyToken } = require('./common/utils/jwt');
const { user, role } = require('./models');

require('dotenv').config();

const middlewares = require('./middlewares');
const router = require('./routes/index');
const swaggerSetup = require('./config/swagger');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Store io in global context for services to access easily
global.io = io;

io.on('connection', async (socket) => {
    console.log('A socket client connected:', socket.id);

    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (token) {
            const decoded = verifyToken(token);
            if (!(decoded instanceof Error) && decoded.id) {
                const userId = decoded.id;
                const userData = await user.findByPk(userId, {
                    include: [{ model: role, as: 'role' }]
                });
                
                if (userData) {
                    socket.userId = userData.id;
                    socket.roleName = userData.role?.nama_role || '';
                    
                    if (socket.roleName === 'Admin') {
                        socket.join('room_admin');
                        console.log(`Admin joined room_admin: ${socket.id}`);
                    } else {
                        socket.join(`room_user_${socket.userId}`);
                        console.log(`User joined room_user_${socket.userId}`);
                    }
                }
            }
        }
    } catch (err) {
        console.error('Socket authentication failed:', err.message);
    }

    socket.on('disconnect', () => {
        console.log('Socket client disconnected:', socket.id);
    });
});

app.use(morgan('dev'));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

swaggerSetup(app);

app.get('/', (req, res) => {
    res.json({
        message: 'Assalamualaikum',
    });
});

app.use('/' , router);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = { app, server, io };