const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const route = require('./routes/index');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const matchHandler = require('./socketHandlers/matchHandler');
const socketAuthMiddleware = require('./socketHandlers/socketAuthMiddleware');
const config = require('./config');

mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongoURL)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', route);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173'
  }
});
io.use(socketAuthMiddleware);

matchHandler(io);

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));