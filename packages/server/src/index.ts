import crypto from "crypto";
import http from "http";

import express from "express";
import WebSocket from "ws";

type WebSocketIncoming = (
  | { type: "login", name: string, roomId: string }
  | { type: "edit", editorState: string }
);

type WebSocketOutgoing = (
  | { type: "edit", editorState: string }
  | { type: "login", name: string }
  | { type: "parseError" }
  | { type: "unknown" }
);

interface WebSocketExt extends WebSocket {
  isAlive?: boolean;
  name?: string;
  roomId?: string;
}

type Room = {
  editorState: string,
  userNames: string[]
};

const rooms: { [roomId: string]: Room } = {};

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const getRoomId = () => crypto.randomBytes(16).toString("hex");
const getNewRoomId = () => {
  let roomId = getRoomId();
  while (Object.prototype.hasOwnProperty.call(rooms, roomId)) {
    roomId = getRoomId();
  }

  return roomId;
};

app.post("/rooms", (req, res) => {
  const roomId = getNewRoomId();
  rooms[roomId] = {
    editorState: req.body.editorState,
    userNames: []
  };

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ roomId }));
});

app.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params;
  res.setHeader("Content-Type", "application/json");

  if (Object.prototype.hasOwnProperty.call(rooms, roomId)) {
    res.end(JSON.stringify(rooms[roomId]));
  } else {
    res.status(404).end();
  }
});

const sendTo = (ws: WebSocketExt, message: WebSocketOutgoing) => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
};

const broadcast = (origin: WebSocketExt, message: WebSocketOutgoing) => {
  wss.clients.forEach((ws: WebSocketExt) => {
    if (ws !== origin) {
      sendTo(ws, message);
    }
  });
};

const signOut = (ws: WebSocketExt) => {
  if (ws.roomId && Object.prototype.hasOwnProperty.call(rooms, ws.roomId)) {
    const room = rooms[ws.roomId];
    const index = room.userNames.findIndex((name) => name === ws.name);

    if (index > -1) {
      room.userNames.splice(index, 1);
    }
  }
};

wss.on("connection", (ws: WebSocketExt) => {
  ws.isAlive = true;

  ws.on("message", (message: string) => {
    let data: WebSocketIncoming;

    try {
      data = JSON.parse(message);
    } catch (error) {
      sendTo(ws, { type: "parseError" });
      return;
    }

    switch (data.type) {
      case "login":
        ws.name = data.name;
        ws.roomId = data.roomId;

        rooms[ws.roomId].userNames.push(ws.name);
        broadcast(ws, { type: "login", name: data.name });

        break;
      case "edit":
        broadcast(ws, { type: "edit", editorState: data.editorState });
        break;
      default:
        sendTo(ws, { type: "unknown" });
        break;
    }
  });

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("close", () => {
    signOut(ws);
  });
});

// Every 10 seconds, loop through the existing connections and:
// - terminate the ones that didn't respond to the last ping
// - mark each of them as not alive (reversed by a successful ping)
// - ping each one of the remaining connections
setInterval(() => {
  wss.clients.forEach((ws: WebSocketExt) => {
    if (!ws.isAlive) {
      signOut(ws);
      ws.terminate();
      return;
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 10000);

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
