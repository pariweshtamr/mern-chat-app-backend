import Chat from "./Chat.schema.js"

export const getChat = (filter) => {
  try {
    const chat = Chat.find(filter)
    return chat
  } catch (error) {
    console.log(error)
  }
}

export const createChat = (chatData) => {
  try {
    const chat = Chat.create(chatData)
    return chat
  } catch (error) {
    console.log(error)
  }
}

export const createGroupChat = (chatData) => {
  try {
    const chat = Chat.create(chatData)
    return chat
  } catch (error) {
    console.log(error)
  }
}

export const findCreatedChat = (_id) => {
  try {
    const chat = Chat.findOne(_id)
    return chat
  } catch (error) {
    console.log(error)
  }
}

export const findCreatedGroupChat = (_id) => {
  try {
    const chat = Chat.findOne(_id)
    return chat
  } catch (error) {
    console.log(error)
  }
}

export const findAllUserChats = (filter) => {
  try {
    const chats = Chat.find(filter)
    return chats
  } catch (error) {
    console.log(error)
  }
}

export const updateGroupChat = (_id, update) => {
  try {
    const chat = Chat.findByIdAndUpdate(_id, update, { new: true })
    return chat
  } catch (error) {
    console.log(error)
  }
}

export const updateLatestMessage = (chatId, updateMsg) => {
  try {
    const update = Chat.findByIdAndUpdate(chatId, updateMsg)
    return update
  } catch (error) {
    console.log(error)
  }
}
