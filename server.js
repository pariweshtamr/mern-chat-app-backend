import dotenv from "dotenv"
dotenv.config()

import express from "express"
const app = express()

import cors from "cors"
import { Server } from "socket.io"
import { chats } from "./data/data.js"

const PORT = process.env.PORT || 8001

// Connect mongoDB
import mongoClient from "./config/db.js"

mongoClient()

app.get("/api/chat", (req, res) => {
  res.send(chats)
})
app.get("/api/chat/:_id", (req, res) => {
  const singleChat = chats.find((c) => c._id === req.params._id)
  res.send(singleChat)
})

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

//Import Routes
import authRouter from "./routes/authRouter.js"
import userRouter from "./routes/userRoute.js"
import chatRouter from "./routes/chatRoute.js"
import messageRouter from "./routes/messageRoute.js"

//Use routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/message", messageRouter)

app.use((error, req, res, next) => {
  const errorStatus = error.status || 500
  const errorMessage = error.message || "Something went wrong!"
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: error.stack,
  })
})

app.use("/", (req, res) => {
  res.json({ message: "Server is ready!" })
})

const server = app.listen(PORT, (error) => {
  if (error) {
    return console.log(error)
  }
  console.log(`Backend server is running at ${PORT}`)
})

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
})

io.on("connection", (socket) => {
  // when user is connected
  console.log("a user is connected")

  socket.on("setup", (userData) => {
    socket.join(userData?._id)
    socket.emit("connected")
  })

  socket.on("join chat", (room) => {
    socket.join(room)
    console.log("User joined Room: " + room)
  })

  socket.on("typing", (room) => socket.in(room).emit("typing"))

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"))

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat
    if (!chat.users) return console.log("chat.users not defined")
    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return
      socket.in(user._id).emit("message received", newMessageReceived)
    })
  })

  socket.off("setup", () => {
    console.log("USER DISCONNECTED")
    socket.leave(userData?._id)
  })
})
