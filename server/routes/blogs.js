import express from 'express';
import supabase from '../supabaseClient.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const router = express.Router();

// Set up multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Upload image to Supabase Storage
router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });

  const fileExt = path.extname(file.originalname);
  const fileName = `${uuidv4()}${fileExt}`;
  const filePath = `blogs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-assets')
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return res.status(500).json({ error: uploadError.message });
  }

  const { data: publicUrlData } = supabase.storage
    .from('blog-assets')
    .getPublicUrl(filePath);

  res.status(200).json({ url: publicUrlData.publicUrl });
});

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*');
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET a single blog by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: blog, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    res.json(blog);
  } catch (err) {
    console.error('Error fetching blog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE a new blog
router.post('/', async (req, res) => {
  const { title, content, imageUrl } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const slug = generateSlug(title);
  const createdat = new Date().toISOString();
  const updatedat = createdat;

  try {
    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert([{ title, content, coverImage: imageUrl, slug, createdat, updatedat }])
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(newBlog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE a blog by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, imageUrl } = req.body;

  const updates = {
    updatedat: new Date().toISOString()
  };

  if (title) {
    updates.title = title;
    updates.slug = generateSlug(title);
  }
  if (content) updates.content = content;
  if (imageUrl) updates.coverImage = imageUrl;

  try {
    const { data: updatedBlog, error } = await supabase
      .from('blogs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(updatedBlog);
  } catch (err) {
    console.error('Error updating blog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a blog by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: deletedBlog, error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(deletedBlog);
  } catch (err) {
    console.error('Error deleting blog:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
