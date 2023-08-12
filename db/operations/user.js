import { User } from "../models/user.js";

export const createUser = async (username, email, password) => {
  const allUsers = await findAllUsers();
  const userInfo = {
    user_id: allUsers.length + 1,
    created: Date.now(),
    username,
    email,
    password,
    contacts: [],
  };
  const newUser = new User(userInfo);
  newUser.save();
  return userInfo;
};

export const checkLogin = async (username, password) => {
  const user = await User.findOne({
    username,
  });
  const authResult = {
    user: user,
    isAuthN: user.password === password,
  };
  return authResult;
};

export const findUser = async (username) => {
  const user = await User.findOne({
    username,
  });
  return user;
};

export const findAllUsers = async () => {
  console.log("entering findAllUsers....");
  const allUsers = await User.find({});
  console.log("[findAllUsers:allUsers]: ", allUsers);
  return allUsers;
};
