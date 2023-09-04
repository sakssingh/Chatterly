const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId, chatId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("UserId not sent with the Request");
  }

  const currentUserId = req.user._id;

  var chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [currentUserId, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  chat = await User.populate(chat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (chat) {
    res.status(200).json(chat);
  } else {
    const createdChat = await Chat.create({
      users: [currentUserId, userId],
      chatName: "sender",
    });

    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );

    if (fullChat) {
      res.status(200).json(fullChat);
    } else {
      res.status(400);
      throw new Error("failed to create chat");
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  var chats = await Chat.find({ users: req.user._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage")
    .sort({ updatedAt: -1 });

  chats = await User.populate(chats, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  res.status(200).json(chats);
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.users) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  if (req.body.users.length <= 1) {
    res.status(400);
    throw new Error("select atleast two members");
  }

  req.body.users.push(req.user._id);

  const groupChat = await Chat.create({
    chatName: req.body.name,
    isGroupChat: true,
    users: req.body.users,
    groupAdmin: req.user._id,
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (groupChat) {
    res.status(200);
    res.json(fullGroupChat);
  } else {
    res.status(400);
    throw new Error("error while creating the chat");
  }
});
4;

const renameGroup = asyncHandler(async (req, res) => {
  const { name, chatId } = req.body;

  console.log("hello");

  if (!name) {
    res.status(400);
    throw new Error("Please enter the new Group Name!");
  }

  const groupChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: name,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!groupChat) {
    res.status(404);
    throw new Error("chat not found!");
  } else {
    res.status(200);
    res.json(groupChat);
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const user = await User.findById(userId);
  const chat = await Chat.findById(chatId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!chat) {
    res.status(404);
    throw new Error("chat not found");
  }


  const isPresent = await Chat.findOne({ _id: chatId, users: user });

  if (isPresent) {
    res.status(400);
    throw new Error("User already present in the Chat");
  } else {
    chat.users.push(userId);
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200);
    res.json(updatedChat);
  }
});

const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const user = await User.findById(userId);
  const chat = await Chat.findById(chatId);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!chat) {
    res.status(404);
    throw new Error("chat not found");
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Failed to remove the user");
  } else {
    res.status(200).json(removed);
  }
});

module.exports = {
  fetchChats,
  accessChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
