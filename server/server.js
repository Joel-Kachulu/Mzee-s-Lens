import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSMongoose from '@adminjs/mongoose';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import compression from 'compression';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import ImageUpload from './components/ImageUpload.js';

// Models
import Blog from './models/Blog.js';
import Admin from './models/Admin.js';
import File from './models/File.js';

// Routes
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blogs.js';

// Fix __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database
});

const app = express();

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Temporarily disable for AdminJS assets
}));
app.use(compression());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('MongoDB connected');
  createInitialAdmin();
})
.catch(err => console.error('MongoDB connection error:', err));

// Create initial admin if none exists
const createInitialAdmin = async () => {
  const exists = await Admin.findOne();
  if (!exists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', password: hashedPassword });
    console.log('Initial admin created - username: admin, password: admin123');
  }
};

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Add file upload endpoint for EditorJS
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: 0, error: 'No file uploaded' });
    }

    // Create a file record in MongoDB
    const file = new File({
      filename: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    await file.save();

    res.json({
      success: 1,
      file: {
        url: `/uploads/${req.file.filename}`,
        // Include additional info if needed by your frontend
        publicId: file._id,
        name: req.file.originalname
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: 0, error: 'Upload failed' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// AdminJS setup with enhanced blog editing
const admin = new AdminJS({
  resources: [
    {
      resource: Blog,
      options: {
        properties: {
          title: { isTitle: true },
          slug: {
            isVisible: { list: true, show: true, edit: false }
          },
          content: {
            type: 'richtext',
            isVisible: {
              list: false,
              edit: true,
              filter: false,
              show: true
            }
          },
          coverImage: {
            type: 'string',
            components: {
              edit: ImageUpload, 
              show: ImageUpload
            },
            isVisible: {
              list: true,
              edit: true,
              filter: false,
              show: true
            }
          },
          createdAt: {
            isVisible: { edit: false }
          },
          updatedAt: {
            isVisible: { edit: false }
          }
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.title) {
                request.payload.slug = request.payload.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
              }
              return request;
            }
          },
          edit: {
            before: async (request) => {
              if (request.payload?.title) {
                request.payload.slug = request.payload.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, '-')
                  .replace(/-+/g, '-')
                  .replace(/^-|-$/g, '');
              }
              return request;
            }
          }
        }
      }
    },
    Admin
  ],
  branding: {
    companyName: 'Mzee Blog Site',
    logo: false,
    theme: {
      colors: {
        primary100: '#3498db',
        primary80: '#5faee3',
        primary60: '#8bc4ea',
        primary40: '#b7d9f1'
      }
    }
  },
  rootPath: '/admin',
  dashboard: {
    handler: async () => {
      const blogCount = await Blog.countDocuments();
      return { 
        message: 'Welcome to Admin Dashboard',
        blogCount: blogCount
      }
    }
  }
});

// AdminJS router
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      try {
        const admin = await Admin.findOne({ username: email }).select('+password');
        if (!admin) return null;
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return null;
        
        return {
          email: admin.username,
          title: admin.username
        };
      } catch (error) {
        console.error('AdminJS auth error:', error);
        return null;
      }
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.COOKIE_SECRET || 'default-strong-secret-32-characters'
  },
  null,
  {
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET || 'default-strong-secret-32-characters',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }
);

// Mount AdminJS before other routes
app.use(admin.options.rootPath, adminRouter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Serve AdminJS assets
app.use(express.static(path.join(__dirname, 'node_modules', 'adminjs', 'public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin`);
  console.log(`Test credentials: admin/admin123`);
});