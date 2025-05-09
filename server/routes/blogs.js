import express from 'express';
import Blog from '../models/Blog.js';
import authMiddleware from '../middleware/auth.js';  // Add .js extension

const router = express.Router();

// Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({}, 'title slug excerpt coverImage isPublished publishedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(20); // optional: limits number of blogs returned
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get single blog (public)
router.get('/view/:id', async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
});

// Create blog (admin only)
router.post('/create', authMiddleware, async (req, res) => {
  const newBlog = new Blog(req.body);
  await newBlog.save();
  res.status(201).json(newBlog);
});

// Update blog (admin only)
router.put('/update/:id', authMiddleware, async (req, res) => {
  const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.delete('/delete/:id', authMiddleware, async (req, res) => {
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
