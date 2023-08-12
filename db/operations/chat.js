import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";
import { findUser } from "./user.js";

export const startChat = async (username, contactUsername) => {
  const user = {
    profile: await findUser(username),
  };
  // const userSocketId = getSocketId(username);
  const userSocketId = user.profile?.socket_id;
  if (!userSocketId) {
    console.log("Error starting chat! User does not have socket id");
    return null;
  }
  const contact = {
    profile: findUser(contactUsername),
  };
  // const contactSocketId = getSocketId(contactUsername);
  const contactSocketId = contact.profile?.socket_id;
  if (!contactSocketId) {
    console.log("Error starting chat! Contact does not have socket id");
    return null;
  }
  // let chatId = [];
  // chatId.push(username);
  // recipients.forEach((r) => {
  //   chatId.push(r.recipient_username);
  // });
  // chatId = chatId.join(":");
  // const newChat = {
  //   user_id: user.profile.user_id,
  //   chat_id: chatId,
  //   socket_ids: {
  //     user_socket_id: socketId,
  //     recipients: recipients,
  //   },
  // };
  // const chat = new Chat(newChat);
  // chat.save();
  // return newChat;
};

export const getSocketId = async (username) => {
  const user = {
    profile: await findUser(username),
  };
  if (!user.profile) {
    console.log("No user found!");
    return null;
  } else if (!user.profile.socket_id) {
    console.log("old user before socket_id was added to User model!");
    return null;
  } else {
    return user.profile.socket_id;
  }
};

export const setSocketId = async (username, socketId) => {
  const user = {
    profile: await findUser(username),
  };
  const filter = {
    username,
  };
  const update = {
    s: {
      $set: {
        socket_id: socketId,
      },
    },
  };
  const result = User.findOneAndUpdate(fitler, update.s);
};
