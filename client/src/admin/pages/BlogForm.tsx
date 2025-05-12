// BlogForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function BlogForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchBlog = async () => {
        try {
          const res = await api.get(`/api/blogs/${id}`);
          const blog = res.data;
          setTitle(blog.title);
          setContent(blog.content);
          setImageUrl(blog.imageUrl || '');
        } catch (err) {
          console.error(err);
          alert('Failed to load blog.');
        }
      };
      fetchBlog();
    }
  }, [id, isEditMode]);

  const handleSubmit = async () => {
    if (!title || !content) return alert('Title and content are required.');
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/api/blogs/${id}`, { title, content, imageUrl });
        alert('Article updated!');
      } else {
        await api.post('/api/blogs', { title, content, imageUrl });
        alert('Article created!');
      }
      navigate('/manageblogs');
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">{isEditMode ? 'Edit Article' : 'Create New Article'}</h2>
      <input
        className="form-control mb-2"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="form-control mb-2"
        placeholder="Content"
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input
        className="form-control mb-3"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button className="btn btn-success" onClick={handleSubmit} disabled={loading}>
        {loading ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Changes' : 'Create Article'}
      </button>
    </div>
  );
}
