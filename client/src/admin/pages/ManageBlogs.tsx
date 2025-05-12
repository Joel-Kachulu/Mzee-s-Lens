// ManageBlogs.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
}

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/api/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this blog?');
    if (!confirmed) return;

    setLoading(true);
    try {
      await api.delete(`/api/blogs/${id}`);
      await fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete the article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Manage Blogs</h2>

      <div className="mb-4 text-end">
        <button className="btn btn-success" onClick={() => navigate('/admin/blogs/create')}>
          + Create New Article
        </button>
      </div>

      <h5>Existing Articles</h5>
      {blogs.length === 0 ? (
        <p>No articles found.</p>
      ) : (
        <ul className="list-group">
          {blogs.map((blog) => (
            <li key={blog.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-start flex-wrap">
                <div>
                  <strong>{blog.title}</strong>
                  <p className="mb-1 small text-muted">
                    {blog.content.replace(/<[^>]+>/g, '').slice(0, 100)}...
                  </p>
                  {blog.imageUrl && (
                    <img src={blog.imageUrl} alt="Blog" style={{ width: '100px', borderRadius: '4px' }} />
                  )}
                </div>
                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => navigate(`/admin/blogs/edit/${blog.id}`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(blog.id)}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
