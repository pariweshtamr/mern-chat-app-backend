import Message from "./Message.schema.js"

// Populate sender user info to message model
export const populateSenderInfo = (isChat, filter) => {
  try {
    const sender = Message.populate(isChat, filter)
    return sender
  } catch (error) {
    console.log(error)
  }
}

export const createMessage = async (newMsg) => {
  try {
    const msg = await Message.create(newMsg)
    return msg
  } catch (error) {
    console.log(error)
  }
}

export const fetchMessages = async (chatId) => {
  try {
    const msgs = await Message.find({ chat: chatId })
      .populate("sender", "displayName avatarImage email")
      .populate("chat")
    return msgs
  } catch (error) {
    console.log(error)
  }
}
