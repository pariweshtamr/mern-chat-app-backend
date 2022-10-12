import express from "express"
import { comparePassword, hashPassword } from "../helpers/bcrypt.helper.js"
import {
  findAUserByEmail,
  getUserByUsername,
  registerUser,
} from "../models/user/User.model.js"
import { createError } from "../utils/error.js"
import { generateToken } from "../utils/generateToken.js"

const authRouter = express.Router()

authRouter.all("/", (req, res, next) => {
  next()
})

//Register user
authRouter.post("/register", async (req, res, next) => {
  const { email } = req.body
  try {
    const userExists = await findAUserByEmail(email)
    if (userExists) {
      res.status(400).json({ message: "User already exists" })
    }

    if (!userExists) {
      //encrypt password coming from client
      const hashPass = hashPassword(req.body.password)

      if (hashPass) {
        req.body.password = hashPass
        const user = await registerUser(req.body)

        return res.status(200).json({
          status: "success",
          message: "New user has been registered successfully.",
          user,
          token: await generateToken(user._id),
        })
      }
      res.status(500).json({
        status: "error",
        message: "Unable to create new user. Please try again later.",
      })
    }
  } catch (error) {
    next(error)
  }
})

//login User
authRouter.post("/login", async function (req, res, next) {
  try {
    const { email, password } = req.body

    const user = await findAUserByEmail(email)
    if (user._id) {
      //compare password
      const comparePass = comparePassword(password, user.password)
      if (comparePass) {
        user.password = undefined

        return res.json({
          status: "success",
          message: "Login successful",
          user,
          token: await generateToken(user._id),
        })
      }
    }
    res.status(401).json({
      status: "error",
      message: "Wrong username or password!",
    })
  } catch (error) {
    next(error)
    res.status(500).json({
      status: "error",
      message: "Wrong Username or Password!",
    })
  }
})

export default authRouter
