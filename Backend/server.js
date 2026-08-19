import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import User from './models/User.js'
import authRoutes from './routes/authRoutes.js'
import emergencyRoutes from './routes/emergencyRoutes.js'
import notificationRoutes from './routes/notificationroutes.js'
import hospitalRoutes from "./routes/hospitalroutes.js";
import inventoryRoutes from "./routes/inventoryroutes.js";
import dashboardRoutes from "./routes/DashboardRoutes.js";
import ReportRoutes from "./routes/ReportRoutes.js";
import donorRoutes from './routes/donorRoutes.js'



const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()

const seedAdminUser = async () => {
  const adminEmail = 'admin@bloodbank.local'
  const existingAdmin = await User.findOne({ email: adminEmail })

  if (!existingAdmin) {
    const password = 'Admin123'
    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({
      username: 'admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    })
    console.log(`Seeded admin user: ${adminEmail}`)
  }
}



// Support multiple origins: comma-separated FRONTEND_URL or Railway wildcard
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Railway health checks)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`))
  },
  credentials: true,
}))
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/notification', notificationRoutes)
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", ReportRoutes);
app.use('/api/donors', donorRoutes)


// get yar oo tijaabo ah  server-ka haduu shaqaynayo intan hakuuso baxdo
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Blood bank API is connected' })
})

app.get('/', (req,res) => {
    res.send('Blood bank server is ok');
})

const PORT = process.env.PORT || 5000
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
})

// Connect to MongoDB AFTER server starts — keeps healthcheck fast
connectDB()
  .then(() => seedAdminUser())
  .catch((err) => console.warn('Database connection skipped at startup:', err.message))

