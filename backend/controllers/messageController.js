const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const mongoose = require("mongoose");

const sendMessage = asyncHandler(async (req, res) => {
  const { text, chatId } = req.body;

  try {
    const message = new Message({
      _id: new mongoose.Types.ObjectId(),
      sender: req.user._id,
      content: text,
      chat: chatId,
    });

    await message.save();

    const mes = await Message.findById(message._id)
      .populate("sender", "-password")
      .populate("chat")
      .populate({ path: "chat", populate: { path: "users" } });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: mes });

    res.status(200).json(mes);
  } catch (err) {
    res.status(500);
    throw new Error("Problem sending the message");
  }
});

const getMessages = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;

  await Message.updateMany({ chat: chatId }, { isRead: true });

  const messages = await Message.find({ chat: chatId })
    .populate("sender", "-password")
    .sort({ createdAt: 1 });

  res.status(200).json(messages);
});

module.exports = { sendMessage, getMessages };
