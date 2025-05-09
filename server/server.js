import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bodyParser from 'body-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Models
import Blog from './models/Blog.js';
import Admin from './models/Admin.js';
import File from './models/File.js';

// Routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup env
dotenv.config();

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: 'https://mzee-s-lens-2jdw.vercel.app',
  credentials: true,
  exposedHeaders: ['Authorization'],
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => {
    console.log('✅ MongoDB connected');
    createInitialAdmin();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Create default admin
const createInitialAdmin = async () => {
  const exists = await Admin.findOne();
  if (!exists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', password: hashedPassword });
    console.log('✅ Initial admin created - username: admin, password: admin123');
  }
};

// Image Upload API
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: 0, error: 'No file uploaded' });

    const file = new File({
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    await file.save();

    res.json({
      success: 1,
      file: {
        url: `/uploads/${req.file.filename}`,
        publicId: file._id,
        name: req.file.originalname
      }
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ success: 0, error: 'Upload failed' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
