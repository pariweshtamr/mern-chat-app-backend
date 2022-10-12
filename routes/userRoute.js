import express from "express"
import { protect } from "../middlewares/auth.middleware.js"
import {
  getAllUsersExceptLoggedInUser,
  getByIdAndUpdate,
} from "../models/user/User.model.js"

const userRouter = express.Router()

userRouter.get("/", protect, async (req, res, next) => {
  //$regex provides regular expression capabilities for pattern matching strings in queries
  // $options: 'i' (case insensitivity to match upper and lower cases)
  try {
    //req.user value coming from protect middleware
    const keyword = req.query.search
      ? {
          $or: [
            { displayName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {}

    const users = await getAllUsersExceptLoggedInUser(
      keyword,
      req.user._id
    ).select("-password")
    // .select('-password) returns user without the password
    res.status(200).json({ status: "success", users })
  } catch (error) {
    next(error)
  }
})

userRouter.get("/all/:_id", async (req, res, next) => {
  try {
    // get all other users from db expect for your own data (here: _id in params is your id)
    // $ne selects the documents where the value of the field is not equal to the specified value. This includes documents that do not contain the field.
    const users = await getAllUsers({ _id: { $ne: req.params._id } }).select([
      "email",
      "displayName",
      "avatarImage",
      " _id",
    ])
    return res.status(200).json({ status: "success", users })
  } catch (error) {
    next(error)
  }
})

userRouter.patch("/:_id", async (req, res, next) => {
  try {
    const { _id } = req.params
    const avatarImage = req.body.image
    const userData = await getByIdAndUpdate(_id, {
      isAvatarImageSet: true,
      avatarImage,
    })
    return res.status(200).json({
      status: "success",
      message: "User avatar has been set.",
      image: userData?.avatarImage,
    })
  } catch (error) {
    next(error)
  }
})

export default userRouter
