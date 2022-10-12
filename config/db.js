import mongoose from "mongoose"

const mongoClient = async () => {
  if (!process.env.MONGO_URL) {
    console.log(
      "MONGO_URL is not defined. Please create MONGO_URL and provide a MongoDB connection string"
    )
  }
  try {
    const connectionString = await mongoose.connect(
      process.env.MONGO_URL
        ? process.env.MONGO_URL
        : "mongodb://localhost/Cha_app"
    )
    if (connectionString) {
      return console.log("MongoDB Connected")
    }
    console.log("Failed to connect to MongoDB")
  } catch (error) {
    console.log(error)
  }
}

export default mongoClient
