import jwt from "jsonwebtoken"

export const createAccessJWT = async (_id) => {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresInd: "1d",
  })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    return error.message
  }
}
