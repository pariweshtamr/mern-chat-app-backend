import express, { request } from "express"
import { protect } from "../middlewares/auth.middleware.js"
import {
  createChat,
  createGroupChat,
  findAllUserChats,
  findCreatedChat,
  findCreatedGroupChat,
  getChat,
  updateGroupChat,
} from "../models/chat/Chat.model.js"
import { populateSenderInfo } from "../models/message/Message.model.js"

const chatRouter = express.Router()

//create chat one-to-one chat
chatRouter.post("/", protect, async (req, res, next) => {
  const { userId } = req.body
  try {
    if (!userId) {
      console.log("Foreign UserId not sent with request")
      return
    }
    // since we are creating a one-to-one chat, we are first finding chats that are one-to-one so isGroupChat is false
    // next we will find the chat consisting of the logged in user and the foreign user using $and (mongodb operator)
    var isChat = await getChat({
      isGroupChat: false,
      // $and performs a logical AND operation on an array of one or more expressions (<expression1>, <expression2>, and so on) and selects the documents that satisfy all the expressions.
      // here both expressions have to be true
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],

      // The $elemMatch Operator of the MongoDB is used to find documents with at least one array field. The finding operation matches the data in the array field with the criteria mentioned with the $elemMatch. $elemMatch is an operator by MongoDB that is used to match elements in an array.
    })
      .populate("users", "-password")
      .populate("latestMessage")

    isChat = await populateSenderInfo(isChat, {
      path: "latestMessage.sender",
      select: "displayName email avatarImage ",
    })

    if (isChat?.length > 0) {
      res.json(isChat[0])
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      }

      try {
        const createdChat = await createChat(chatData)
        const fullChat = await findCreatedChat({
          _id: createdChat._id,
        }).populate("users", "-password")

        res.status(200).json(fullChat)
      } catch (error) {
        res.status(400).json(error.message)
      }
    }
  } catch (error) {
    next(error)
  }
})

//fetch chats
chatRouter.get("/", protect, async (req, res, next) => {
  try {
    // check which user is logged in
    const userChats = await findAllUserChats({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await populateSenderInfo(results, {
          path: "latestMessage.sender",
          select: "displayName email avatarImage",
        })
        res.status(200).json(results)
      })
  } catch (error) {
    next(error)
  }
})

// create group chat
chatRouter.post("/group", protect, async (req, res, next) => {
  const { users, chatName } = req.body
  if (!users || !chatName) {
    return res.status(400).json({ message: "Please fill all the fields" })
  }

  if (users.length < 2) {
    res.status(400).json({
      message: "More than 2 users are rquired to form a group chat!",
    })
  }
  // users + current logged in user
  users.push(req.user)
  try {
    const groupChat = await createGroupChat({
      chatName,
      users,
      isGroupChat: true,
      groupAdmin: req.user,
    })

    const fullGroupChatInfo = await findCreatedGroupChat({
      _id: groupChat._id,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    res.status(200).json(fullGroupChatInfo)
  } catch (error) {
    next(error)
  }
})

// rename group chat
chatRouter.put("/group", protect, async (req, res, next) => {
  const { chatId, chatName } = req.body
  try {
    const updatedChat = await updateGroupChat(chatId, {
      chatName,
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!updatedChat) {
      res.status(400).json({ message: "Chat not found!" })
    } else {
      res.status(500).json(updatedChat)
    }
  } catch (error) {
    next(error)
  }
})

// add user to group
chatRouter.put("/groupAdd", protect, async (req, res, next) => {
  const { chatId, userId } = req.body
  try {
    const added = await updateGroupChat(chatId, {
      $push: { users: userId },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!added) {
      res.status(400).json({ message: "Chat not found!" })
    } else {
      res.status(200).json(added)
    }
  } catch (error) {
    next(error)
  }
})

// remove user to group
chatRouter.put("/groupRemove", protect, async (req, res, next) => {
  const { chatId, userId } = req.body

  try {
    const removed = await updateGroupChat(chatId, {
      $pull: { users: userId },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!removed) {
      res.status(400).json({ message: "Chat not found!" })
    } else {
      res.status(200).json(removed)
    }
  } catch (error) {
    next(error)
  }
})

export default chatRouter
