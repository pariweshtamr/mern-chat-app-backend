import jwt from "jsonwebtoken"
import { verifyToken } from "../helpers/jwt.helper.js"
import { getUserById } from "../models/user/User.model.js"
import { createError } from "../utils/error.js"

export const protect = async (req, res, next) => {
  try {
    const { authorization } = req.headers

    if (authorization) {
      //validate token
      const decoded = verifyToken(authorization)

      req.user = await getUserById(decoded._id).select("-password")
      next()
    }
  } catch (error) {
    res.status(401)
    next(createError("Not authorized, token failed"))
  }
}
