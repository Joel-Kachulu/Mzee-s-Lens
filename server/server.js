// index.js
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
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { ComponentLoader } from 'adminjs';
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

// Register AdminJS Mongoose adapter
AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: 'https://mzee-s-lens-2jdw.vercel.app',
  credentials: true,
  exposedHeaders: ['Authorization'],
}));
app.use(express.json());
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

// AdminJS Custom Component
const componentLoader = new ComponentLoader();
const imageUploadComponent = componentLoader.add('ImageUpload', path.join(__dirname, 'components', 'ImageUpload.jsx'));

// AdminJS Setup
const admin = new AdminJS({
  resources: [
    {
      resource: Blog,
      options: {
        properties: {
          title: { isTitle: true },
          slug: {
            isVisible: { list: true, show: true, edit: false },
          },
          content: {
            type: 'richtext',
            isVisible: {
              list: false,
              edit: true,
              filter: false,
              show: true,
            },
          },
          coverImage: {
            type: 'string',
            components: {
              edit: imageUploadComponent,
              show: imageUploadComponent,
            },
            isVisible: {
              list: true,
              edit: true,
              filter: false,
              show: true,
            },
          },
          createdAt: { isVisible: { edit: false } },
          updatedAt: { isVisible: { edit: false } },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.title) {
                request.payload.slug = request.payload.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '');
              }
              return request;
            },
          },
          edit: {
            before: async (request) => {
              if (request.payload?.title) {
                request.payload.slug = request.payload.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '');
              }
              return request;
            },
          },
        },
      },
    },
    Admin,
  ],
  branding: {
    companyName: 'Mzee Blog Site',
    logo: false,
    theme: {
      colors: {
        primary100: '#3498db',
        primary80: '#5faee3',
        primary60: '#8bc4ea',
        primary40: '#b7d9f1',
      },
    },
  },
  componentLoader,
  rootPath: '/admin',
  dashboard: {
    handler: async () => {
      const blogCount = await Blog.countDocuments();
      return {
        message: 'Welcome to Admin Dashboard',
        blogCount,
      };
    },
  },
});

// AdminJS Auth + Router with MongoDB session store
const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin,
  {
    authenticate: async (email, password) => {
      const admin = await Admin.findOne({ username: email }).select('+password');
      if (!admin) return null;

      const isMatch = await bcrypt.compare(password, admin.password);
      return isMatch ? { email: admin.username } : null;
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.COOKIE_SECRET || 'default-strong-secret-32-characters',
  },
  null,
  {
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET || 'default-strong-secret-32-characters',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  }
);

app.use(admin.options.rootPath, adminRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🛠 Admin panel: http://localhost:${PORT}/admin`);
  console.log(`👤 Test credentials: admin / admin123`);
});
