import { Contact } from "../models/contact.js";
import { User } from "../models/user.js";
import { findUser } from "./user.js";

export const addContact = async (username, contactUsername) => {
  /**
   * Check if contact with contactUsername already exists.
   * If already exists, don't create new contact.
   */
  let result;
  const contact = {
    username: contactUsername,
    messages: [],
    last_interaction_date: Date.now(),
  };
  const filter = {
    username,
  };
  const user = await findUser(username);
  const userContact = await findUser(contactUsername);
  contact.contact_user_id = userContact.user_id;
  const update = {
    contacts: [...user.contacts],
  };
  const contactExists = await checkForExistingContact(user, contactUsername);
  if (!contactExists) {
    update.contacts.push(contact);
    result = await User.findOneAndUpdate(filter, update);
  } else {
    result = "contact already exists";
  }
  return result;
};

export const updateLastInteraction = async (username, contactUsername) => {
  let result;
  const filter = {
    user: {
      username,
    },
    contact: {
      username: contactUsername,
    },
  };
  let uc = await addContact(contactUsername, username);
  const user = {
    profile: await findUser(username),
    c: uc === "contact already exists" ? await findUser(contactUsername) : uc,
  };
  uc = user.c.contacts.find((c) => c.username === username);
  let cu = await addContact(username, contactUsername);
  const contact = {
    profile: await findUser(contactUsername),
    c: cu === "contact already exists" ? await findUser(username) : cu,
  };
  cu = contact.c.contacts.find((c) => c.username === contactUsername);
  user.c = cu;
  contact.c = uc;

  const now = Date.now();

  const $setUser = {
    $set: {
      $set: {
        "contacts.$[contact]": {
          contact_user_id: user.c.user_id,
          username: user.c.username,
          messages: [...user.c.messages],
          last_interaction_date: now,
        },
      },
    },
    arrayFilters: {
      arrayFilters: [
        {
          "contact.username": contactUsername,
        },
      ],
    },
  };
  const $setUserContact = {
    $set: {
      $set: {
        "contacts.$[contact]": {
          contact_user_id: contact.c.user_id,
          username: contact.c.username,
          messages: [...contact.c.messages],
          last_interaction_date: now,
        },
      },
    },
    arrayFilters: {
      arrayFilters: [
        {
          "contact.username": username,
        },
      ],
    },
  };

  result = await User.findOneAndUpdate(
    filter.user,
    $setUser.$set,
    $setUser.arrayFilters
  );
  await User.findOneAndUpdate(
    filter.contact,
    $setUserContact.$set,
    $setUserContact.arrayFilters
  );

  return result;
};

export const listContacts = async (username) => {
  const user = await findUser(username);
  if (!user) {
    console.error("ERROR: user does not exist");
    return;
  }
  return user.contacts.length > 0 ? user.contacts : [];
};

export const updateContact = async (username, contactUsername) => {
  const user = {
    profile: await findUser(username),
  };
  const contact = {
    profile: await findUser(contactUsername),
  };
  const filter = {
    user: {
      username: username,
    },
    contact: {
      username: contactUsername,
    },
  };
  const result = {};

  user.profile.contacts.forEach((c) => {
    if (c.username === contactUsername) {
      result.userContact = c;
    }
  });
  contact.profile.contacts.forEach((c) => {
    if (c.username === username) {
      result.contactUser = c;
    }
  });

  const $setUserContact = {
    $set: {
      "contacts.$[contact]": {
        ...result.userContact,
        contact_user_id: contact.profile.user_id,
      },
    },
    arrayFilters: [{ "contact.username": contactUsername }],
  };
  const $setContactUser = {
    $set: {
      "contacts.$[contact]": {
        ...result.contactUser,
        contact_user_id: user.profile.user_id,
      },
    },
    arrayFilters: [{ "contact.username": username }],
  };

  result.userContactResult = await User.findOneAndUpdate(
    filter.user,
    {
      $set: $setUserContact.$set,
    },
    {
      arrayFilters: $setUserContact.arrayFilters,
    }
  );
  result.contactUserResult = await User.findOneAndUpdate(
    filter.contact,
    {
      $set: $setContactUser.$set,
    },
    {
      arrayFilters: $setContactUser.arrayFilters,
    }
  );

  return result;
};

export const checkForExistingContact = async (user, contactUsername) => {
  console.log("[checkForExistingContact:user]:", user);
  const contactExists = !!user.contacts.find(
    (c) => c.username === contactUsername
  );
  console.log("[checkForExistingContact:contactExists]:", contactExists);
  return contactExists;
};
