import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin123:admin123@co3pe.8g40s.mongodb.net/?retryWrites=true&w=majority&appName=co3pe'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env')
}

let isConnected = false

export default async function dbConnect() {
  if (isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      // Add these options for MongoDB Atlas connection
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    
    isConnected = db.connections[0].readyState === 1
    console.log('Connected to MongoDB Atlas')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    isConnected = false
    throw error
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
  isConnected = false
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
  isConnected = false
}) 