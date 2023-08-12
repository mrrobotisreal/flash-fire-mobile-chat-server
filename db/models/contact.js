import mongoose from "mongoose";

import { MessageSchema } from "./message.js";

export const ContactSchema = new mongoose.Schema({
  contact_user_id: { type: Number, required: true },
  last_interaction_date: { type: Number, required: true },
  username: { type: String, required: true },
  messages: [MessageSchema],
  chat_ids: [String],
});

export const Contact = mongoose.model("contact", ContactSchema);
