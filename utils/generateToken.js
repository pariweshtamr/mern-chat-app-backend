import jwt from "jsonwebtoken"

export const generateToken = async (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}
