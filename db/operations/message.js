import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { Contact } from "../models/contact.js";
import { findUser } from "./user.js";
import { addContact } from "./contact.js";

export const getAllMessages = async () => {};

export const getContactMessages = async (username, contactUsername) => {
  const user = {
    profile: await findUser(username),
  };
  const messages = {
    messageList: [],
  };

  user.profile.contacts.forEach((c) => {
    if (c.username === contactUsername) {
      messages.messageList = [...c.messages];
    }
  });

  return messages;
};

export const sendMessage = async (
  username,
  contactUsername,
  messageContent
) => {
  console.log("SEND MESSAGE");
  let result;
  const user = {
    profile: await findUser(username),
  };
  const filter = {
    username,
  };
  const contact = {
    profile: await findUser(contactUsername),
  };
  const newMessage = {
    sender_id: user.profile.user_id,
    sender_username: username,
    recipient_id: contact.profile.user_id,
    recipient_username: contactUsername,
    send_date: Date.now(),
    has_been_read: false,
    message_content: messageContent,
  };
  const contactExists = !!user.profile.contacts.find(
    (c) => c.username === contactUsername
  );
  const userInContactExists = !!contact.profile.contacts.find(
    (c) => c.username === username
  );

  if (!contactExists) {
    const addContactResult = await addContact(username, contactUsername);
    if (addContactResult === "contact already exists") {
      console.error("the contact already exists");
    }
  }
  if (!userInContactExists) {
    const addContactResult = await addContact(contactUsername, username);
    if (addContactResult === "contact already exists") {
      console.error("the contact already exists");
    }
  }

  const foundContact = {};
  user.profile.contacts.forEach((c) => {
    if (c.username === contactUsername) {
      foundContact.c = c;
    }
  });
  result = await User.findOneAndUpdate(
    filter,
    {
      $set: {
        "contacts.$[contact].messages": [
          ...foundContact.c.messages,
          newMessage,
        ],
      },
    },
    {
      arrayFilters: [{ "contact.username": contact.profile.username }],
    }
  );
  // .then(() => console.log("successfully updated user contact messages ✅"))
  // .catch((err) => console.error(err));
  console.log("successfully updated user contact messages ✅");

  const foundUser = {};
  contact.profile.contacts.forEach((c) => {
    if (c.username === username) {
      foundUser.u = c;
    }
  });
  filter.username = contactUsername;
  await User.findOneAndUpdate(
    filter,
    {
      $set: {
        "contacts.$[contact].messages": [...foundUser.u.messages, newMessage],
      },
    },
    {
      arrayFilters: [{ "contact.username": user.profile.username }],
    }
  );
  console.log("successfully updated contact contact messages ✅");
  // .then(() => console.log("successfully updated contact contact messages ✅"))
  // .catch((err) => console.error(err));

  return result;
};

export const updateMessages = async (username, contactUsername, message) => {
  const user = {
    profile: await findUser(username),
  };
  const userContact = {
    profile: await findUser(contactUsername),
  };
  const contact = {};
  const filter = {
    username,
  };
  const update = {};
  user.profile.contacts.forEach((c) => {
    if (c.username === contactUsername) {
      contact.c = c;
    }
  });
  const result = await User.findOneAndUpdate(
    filter,
    {
      $set: {
        "contacts.$[id].messages": [...contact.c.messages, message],
      },
    },
    {
      arrayFilters: [
        {
          "id.contact_user_id": userContact.profile.user_id,
        },
      ],
    }
  );

  return result;
};

export const updateReadMessages = async (username, contactUsername) => {
  const userContact = {
    profile: await findUser(contactUsername),
  };
  const filter = {
    username: contactUsername,
  };
  let updatedMessages = [];
  userContact.profile.contacts.forEach((c) => {
    if (c.username === username) {
      c.messages.forEach((m) => {
        m.has_been_read = true;
      });
      updatedMessages = [...c.messages];
    }
  });
  const update = {
    s: {
      $set: {
        "contacts.$[contact].messages": updatedMessages,
      },
    },
    a: {
      arrayFilters: [
        {
          "contact.username": username,
        },
      ],
    },
  };
  const result = await User.findOneAndUpdate(filter, update.s, update.a);
  console.log("updateReadMessages result:", result);
  return result;
};
