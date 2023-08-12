import express from "express";
import { initDB } from "../db/db.js";
initDB();
import {
  createUser,
  checkLogin,
  findUser,
  findAllUsers,
} from "../db/operations/user.js";
import {
  addContact,
  updateContact,
  updateLastInteraction,
  listContacts,
} from "../db/operations/contact.js";
import {
  getAllMessages,
  getContactMessages,
  sendMessage,
  updateMessages,
  updateReadMessages,
} from "../db/operations/message.js";
import { getSocketId, setSocketId } from "../db/operations/chat.js";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 8889;

// app.use(express.json());
// app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {});
app.use(express.json());

io.on("connection", (socket) => {
  // console.log("socket:", socket);
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.emit("sendSocketId", socket.id);

  socket.on("startChat", async ({ username, contactUsername }) => {
    console.log(`${username} started a chat with ${contactUsername}`);
    console.log("updating contact messages");
    const userSocketId = getSocketId(username);
    if (!userSocketId) {
      // update user socket id
    }
    const contactSocketId = getSocketId(contactUsername);
    if (!contactSocketId) {
      // update contact socket id
    }
    const updatedContactMessages = await updateReadMessages(
      username,
      contactUsername
    );

    console.log("updating last interaction");
    const result = await updateLastInteraction(username, contactUsername);
    const contact = result.contacts.find((c) => c.username === contactUsername);
    console.log("updateLAstInteraction result:", contact);

    socket.emit("updatedInteraction", contact);
  });

  socket.on(
    "sendMessage",
    async ({ username, contactUsername, messageContent }) => {
      console.log("sendMessage messageContent:", messageContent);
      console.log(
        "sendMessage username:contactUsername = ",
        username + ":" + contactUsername
      );
      const result = await sendMessage(
        username,
        contactUsername,
        messageContent
      );
      console.log("sendMessage socket result: ", result);
      const getResult = await getContactMessages(username, contactUsername);
      console.log("socket getMessages result: ", getResult.messageList);
      const newMessages = result.contacts.find(
        (c) => c.username === contactUsername
      ).messages;
      console.log("socket newMessages: ", newMessages);
      socket.emit("newMessage", getResult.messageList);
    }
  );

  socket.on("findUser", async ({ username }) => {
    console.log("socket findUser username:", username);
    const result = await findUser(username);
    console.log("socket findUser result:", result);
    socket.emit("foundUser", result);
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

httpServer.listen(8890, () =>
  console.log("socket server listening on port:", 8890)
);

/**
 * START test routes
 */
app.get("/getAllUsers", async (req, res) => {
  console.log("GETting all users...");
  const allUsers = await findAllUsers();
  res.send(allUsers);
});

app.post("/getUser", async (req, res) => {
  console.log("getting a single user");
  const b = req.body;

  const result = await findUser(b.username);

  res.send(result);
});

app.post("/updateContact", async (req, res) => {
  console.log("updating contacts with contact_user_id");
  const b = req.body;

  const result = await updateContact(b.username, b.contactUsername);

  res.send(result);
});

app.post("/updateMessages", async (req, res) => {
  console.log("updating messages");
  const b = req.body;

  const result = await updateMessages(b.username, b.contactUsername, b.message);

  res.send(result);
});

/**
 * END test routes
 */

app.post("/createUser", async (req, res) => {
  console.log("req body:", req.body);
  const b = req.body;

  const userInfo = await createUser(b.username, b.email, b.password);
  console.log("[USER INFO]: ", userInfo);

  res.send(userInfo);
});

app.post("/checkLogin", async (req, res) => {
  const b = req.body;

  const authResult = await checkLogin(b.username, b.password);

  res.send(authResult);
});

app.post("/setSocketId", async (req, res) => {
  console.log("setting socketId on User...");
  const b = req.body;

  const result = await setSocketId(b.username, b.socketId);

  res.send(result.socket_id);
});

app.post("/addContact", async (req, res) => {
  console.log("adding new contact...");
  const b = req.body;
  console.log("body: ", b);

  const result = await addContact(b.username, b.contactUsername);
  console.log("route /addContact result:", result);

  res.send(result);
});

app.put("/updateLastInteraction", async (req, res) => {
  console.log("updating last interaction");
  const b = req.body;
  console.log("body:", b);

  const result = await updateLastInteraction(b.username, b.contactUsername);
  console.log("updateLAstInteraction result:", result);

  res.send(result);
});

app.post("/listContacts", async (req, res) => {
  const b = req.body;

  const contacts = await listContacts(b.username);

  res.send(contacts);
});

app.post("/getMessages", async (req, res) => {
  const b = req.body;

  const messages = await getContactMessages(b.username, b.contactUsername);

  res.send(messages);
});

app.post("/sendMessage", async (req, res) => {
  console.log("req body:", req.body);
  const b = req.body;

  const result = await sendMessage(
    b.username,
    b.contactUsername,
    b.messageContent
  );

  res.send(result);
});

app.listen(port, () => console.log(`serving on port: ${port}`));
