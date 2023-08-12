import mongoose from "mongoose";

import { MessageSchema } from "./message.js";

export const ChatSchema = mongoose.Schema({
  user_id: { type: Number, required: true },
  chat_id: { type: String, required: true },
  socket_ids: {
    user_socket_id: { type: String, required: true },
    recipients: [
      {
        recipient_username: { type: String, required: true },
        recipient_socket_id: { type: String, required: true },
      },
    ],
  },
  messages: [MessageSchema],
});

export const Chat = mongoose.model("Chat", ChatSchema);
