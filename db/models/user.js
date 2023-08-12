import mongoose from "mongoose";

import { ContactSchema } from "./contact.js";

export const UserSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  socket_id: { type: String, required: false },
  created: { type: Number, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  contacts: [ContactSchema],
});

export const User = mongoose.model("User", UserSchema);
