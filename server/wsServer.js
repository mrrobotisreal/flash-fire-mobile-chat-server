/**
 * Time to find a new tutorial, this one already seemed a bit strange to me,
 * and go figure, it's not working... So I found a better one,
 * will start it later.
 *
 * Actually ^ this implementation technically works and started the WSS
 * but I couldn't figure out how to connect to it, that's all.
 * STill found a better implementation though
 */
import { WebSocketServer } from 'ws';
const server = new WebSocketServer({port: 443});

server.on('connection', ws => {
  console.log('new client connected!');
  ws.send('connection established');
  ws.on('close', () => console.log('client has disconnected!'));
  ws.on('message', data => {
    server.clients.forEach(client => {
      console.log(`distributing message: ${data}`);
      client.send(`${data}`);
    });
  });
  ws.onerror = () => {
    console.log('websocket error');
  };
})