import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Footer from './Footer';
import TopBar from './TopBar';
import '../static/blogdetail.css';

interface Blog {
  title: string;
  content: string;
  createdat: string;
  author?: string;
  imageUrl?: string;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/api/blogs/${id}`);
        setBlog(response.data);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const extractFirstImage = (html: string): string | null => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    return img?.src || null;
  };

  const placeholderImage = 'https://via.placeholder.com/800x400?text=No+Image+Available';
  const coverImage =
    blog?.imageUrl || (blog?.content ? extractFirstImage(blog.content) : null) || placeholderImage;

  if (loading) {
    return (
      <div className="dark-theme">
        <TopBar />
        <div className="container-fluid px-15vw d-flex justify-content-center align-items-center min-vh-100 bg-white">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="dark-theme">
        <TopBar />
        <div className="container-fluid px-15vw py-5 bg-white min-vh-100">
          <div className="alert alert-danger" role="alert">
            {error || 'Blog post not found.'}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="dark-theme">
      <TopBar />
      <div className="container-fluid px-15vw">
        <div className="bg-white min-vh-100 py-5">
          <article className="blog-post px-4">
            <div className="mb-4">
              <img
                src={coverImage}
                alt={`Cover image for ${blog.title}`}
                className="img-fluid rounded-0 w-100"
                style={{ maxHeight: '60vh', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = placeholderImage;
                }}
              />
            </div>

            <header className="mb-4 px-3">
              <h1 className="fw-bold mb-3 text-dark display-4">{blog.title || 'Untitled Blog'}</h1>
              <div className="d-flex align-items-center text-muted mb-3">
                {blog.author && (
                  <span className="me-3">
                    <i className="bi bi-person-fill me-2"></i>
                    {blog.author}
                  </span>
                )}
                <span>
                  <i className="bi bi-calendar me-2"></i>
                  {formatDate(blog.createdat)}
                </span>
              </div>
            </header>

            <div
              className="blog-content text-dark px-3 fs-5 lh-base"
              dangerouslySetInnerHTML={{
                __html: blog.content || '<p>No content available.</p>',
              }}
            />

            <footer className="mt-5 pt-4 border-top px-3">
              <Link to="/blogs" className="btn btn-outline-dark">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Blogs
              </Link>
            </footer>
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;
