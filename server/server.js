import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import bodyParser from 'body-parser';

// Supabase (now from shared client file)
import supabase from './supabaseClient.js';

// Routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: 'https://mzee-s-lens-2jdw.vercel.app/',
  credentials: true,
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Image Upload API
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: 0, error: 'No file uploaded' });

    // Optionally upload to Supabase Storage here

    res.json({
      success: 1,
      file: {
        url: `/uploads/${req.file.filename}`,
        publicId: req.file.filename,
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
