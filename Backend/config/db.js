import mongoose from 'mongoose'

const connectDB = async () => {
  // Railway MongoDB plugin sets MONGO_URL automatically
  const mongoUri =
    process.env.MONGO_URL ||
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/blood-bank'

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })
  console.log(`MongoDB connected: ${mongoose.connection.host}`)
}

export default connectDB

