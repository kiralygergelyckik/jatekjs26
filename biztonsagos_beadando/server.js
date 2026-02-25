import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3210;
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8'
};

const rooms = new Map(); 
const clients = new Map(); 

function sendWs(socket, obj) {
  const json = Buffer.from(JSON.stringify(obj));
  const len = json.length;
  let header;

  if (len < 126) {
    header = Buffer.from([0x81, len]);
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  socket.write(Buffer.concat([header, json]));
}

function decodeFrames(buffer) {
  const messages = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const b1 = buffer[offset];
    const b2 = buffer[offset + 1];
    const opcode = b1 & 0x0f;
    const masked = (b2 & 0x80) !== 0;
    let len = b2 & 0x7f;
    let headerSize = 2;

    if (len === 126) {
      if (offset + 4 > buffer.length) break;
      len = buffer.readUInt16BE(offset + 2);
      headerSize = 4;
    } else if (len === 127) {
      if (offset + 10 > buffer.length) break;
      len = Number(buffer.readBigUInt64BE(offset + 2));
      headerSize = 10;
    }

    const maskSize = masked ? 4 : 0;
    if (offset + headerSize + maskSize + len > buffer.length) break;

    const payloadStart = offset + headerSize + maskSize;
    const payload = Buffer.from(buffer.slice(payloadStart, payloadStart + len));

    if (masked) {
      const mask = buffer.slice(offset + headerSize, offset + headerSize + 4);
      for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
    }

    messages.push({ opcode, payload: payload.toString('utf8') });
    offset = payloadStart + len;
  }

  return { messages, remaining: buffer.slice(offset) };
}

function leaveRoom(socket) {
  const meta = clients.get(socket);
  if (!meta || !meta.room) return;
  const room = meta.room;
  const set = rooms.get(room);
  if (set) {
    set.delete(socket);
    set.forEach((peer) => sendWs(peer, { type: 'peer-left', room, peerId: meta.id }));
    if (set.size === 0) rooms.delete(room);
  }
  meta.room = null;
  clients.set(socket, meta);
}

function handleMessage(socket, raw) {
  let msg;
  try { msg = JSON.parse(raw); } catch { return; }

  if (msg.type === 'host' || msg.type === 'join') {
    const room = (msg.room || '').trim();
    if (!room) return;

    leaveRoom(socket);

    if (!rooms.has(room)) rooms.set(room, new Set());
    rooms.get(room).add(socket);

    const meta = clients.get(socket) || {};
    meta.room = room;
    clients.set(socket, meta);

    const set = rooms.get(room);
    const slot = Array.from(set).findIndex((s) => s === socket) + 1;
    sendWs(socket, { type: 'joined', room, role: msg.type === 'host' ? 'host' : 'client', id: meta.id, slot });

    set.forEach((peer) => {
      if (peer !== socket) sendWs(peer, { type: 'peer-joined', room, peerId: meta.id, slot });
    });
    return;
  }

  if (msg.type === 'relay') {
    const meta = clients.get(socket);
    if (!meta?.room) return;

    const set = rooms.get(meta.room);
    if (!set) return;

    set.forEach((peer) => {
      if (peer !== socket) sendWs(peer, { type: 'relay', from: meta.id, payload: msg.payload || null });
    });
  }
}

const server = http.createServer((req, res) => {
  const reqPath = req.url === '/' ? '/index.html' : decodeURIComponent(req.url);
  const safePath = path.normalize(reqPath).replace(/^\.\.+/, '');
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.on('upgrade', (req, socket) => {
  if ((req.headers.upgrade || '').toLowerCase() !== 'websocket') {
    socket.destroy();
    return;
  }

  const key = req.headers['sec-websocket-key'];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  clients.set(socket, { id: crypto.randomUUID(), room: null });
  let incoming = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    incoming = Buffer.concat([incoming, chunk]);
    const decoded = decodeFrames(incoming);
    incoming = decoded.remaining;

    decoded.messages.forEach((m) => {
      if (m.opcode === 0x8) {
        socket.end();
        return;
      }
      if (m.opcode === 0x1) handleMessage(socket, m.payload);
    });
  });

  socket.on('close', () => {
    leaveRoom(socket);
    clients.delete(socket);
  });
  socket.on('end', () => {
    leaveRoom(socket);
    clients.delete(socket);
  });
  socket.on('error', () => {
    leaveRoom(socket);
    clients.delete(socket);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});