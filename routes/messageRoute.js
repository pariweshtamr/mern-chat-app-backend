import express from "express"
import { protect } from "../middlewares/auth.middleware.js"
import { updateLatestMessage } from "../models/chat/Chat.model.js"
import {
  createMessage,
  fetchMessages,
} from "../models/message/Message.model.js"
import User from "../models/user/User.schema.js"

const messageRouter = express.Router()

// send message route
messageRouter.post("/", protect, async (req, res, next) => {
  const { chatId, message } = req.body
  if (!message || !chatId) {
    console.log("Invalid data passed in request")
    return res.status(400)
  }

  let newMessage = {
    sender: req.user._id,
    content: message,
    chat: chatId,
  }

  try {
    let message = await createMessage(newMessage)

    message = await message.populate("sender", "displayName avatarImage")

    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "displayName avatarImage, email",
    })

    await updateLatestMessage(chatId, { latestMessage: message })

    res.json(message)
  } catch (error) {
    next(error)
  }
})

// route to fetch all messages of the particular chat
messageRouter.get("/:chatId", protect, async (req, res, next) => {
  const { chatId } = req.params
  try {
    const messages = await fetchMessages(chatId)
    res.json(messages)
  } catch (error) {
    next(error)
  }
})

export default messageRouter
