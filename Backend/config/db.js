import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer

const connectDB = async () => {
  // Railway MongoDB plugin sets MONGO_URL or MONGODB_URL automatically
  const mongoUri =
    process.env.MONGO_URL ||
    process.env.MONGODB_URL ||
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/blood-bank'
  const useMemoryFallback = process.env.USE_IN_MEMORY_DB === 'true'

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    })
    console.log(`MongoDB connected successfully: ${mongoose.connection.host}`)
    return
  } catch (error) {
    console.error(`Unable to connect to MongoDB at ${mongoUri}: ${error.message}`)
  }

  if (!useMemoryFallback) {
    throw new Error('MongoDB connection failed. Set MONGO_URL or MONGODB_URI environment variable correctly.')
  }

  try {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'blood-bank',
        },
      })
    }

    const memoryUri = mongoServer.getUri()
    await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    })
    console.log(`MongoDB in-memory server connected: ${mongoose.connection.host}`)
    console.warn('Running with an in-memory database. Data will not persist after restart.')
  } catch (error) {
    throw new Error(`MongoDB in-memory connection failed: ${error.message}`)
  }
}

export default connectDB
