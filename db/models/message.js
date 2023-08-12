import mongoose from "mongoose";

export const MessageSchema = new mongoose.Schema({
  sender_id: { type: Number, required: true },
  sender_username: { type: String, required: true },
  recipient_id: { type: Number, required: true },
  recipient_username: { type: String, required: true },
  send_date: { type: Number, required: true },
  has_been_read: { type: Boolean, required: true },
  message_content: { type: String, required: true },
});

export const Message = mongoose.model("Message", MessageSchema);
