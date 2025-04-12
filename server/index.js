const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

let tokens = [];

app.use(cors());
app.use(express.json());

io.on('connection', socket => {
  console.log('A client connected');
});

app.post('/register', (req, res) => {
  const { token } = req.body;
  if (!tokens.includes(token)) tokens.push(token);
  res.sendStatus(200);
});

app.post('/update-rate', async (req, res) => {
  const { rate } = req.body;

  // Emit real-time rate to all clients
  io.emit('rate-update', rate);

  // Send background push notifications
  const message = {
    notification: {
      title: 'Gold Rate Updated',
      body: `New Rate: ₹${rate}`,
    },
    tokens,
  };
  try {
    if (admin.messaging().sendMulticast) {
      await admin.messaging().sendMulticast(message);
    } else {
      for (const token of tokens) {
        await admin.messaging().send({ ...message, token });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

server.listen(5000, () => console.log('Server running on http://localhost:5000'));
