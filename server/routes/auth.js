import express from 'express';
import supabase from '../supabaseClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_here';

// GET all admins
router.get('/', async (req, res) => {
  try {
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, username, email, role, created_at');
    if (error) return res.status(500).json({ error: error.message });
    res.json(admins);
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REGISTER a new admin
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  try {
    const { data: newAdmin, error } = await supabase
      .from('admins')
      .insert([{ username, email, password: hashedPassword, role, created_at: now, updated_at: now }])
      .select('id, username, email, role, created_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(newAdmin);
  } catch (err) {
    console.error('Error registering admin:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// LOGIN admin
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !admin) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({ token });
});

// UPDATE admin
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;
  const updated_at = new Date().toISOString();

  const updates = { updated_at };
  if (username) updates.username = username;
  if (email) updates.email = email;
  if (role) updates.role = role;
  if (password) updates.password = await bcrypt.hash(password, 10);

  try {
    const { data: updatedAdmin, error } = await supabase
      .from('admins')
      .update(updates)
      .eq('id', id)
      .select('id, username, email, role, created_at, updated_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(updatedAdmin);
  } catch (err) {
    console.error('Error updating admin:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE admin
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: deletedAdmin, error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id)
      .select('id, username, email')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(deletedAdmin);
  } catch (err) {
    console.error('Error deleting admin:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
