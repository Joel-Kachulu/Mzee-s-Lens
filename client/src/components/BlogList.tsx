import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

interface Blog {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get('api/blogs');
        setBlogs(response.data);
      } catch (err) {
        setError('Failed to fetch blogs. Please try again later.');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

  const extractFirstImage = (html: string): string | null => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    return img ? img.src : null;
  };

  const SkeletonLoader = () => (
    <div className="col-md-4 mb-4">
      <div className="card h-100">
        <div className="card-img-top placeholder" style={{ height: '200px' }}></div>
        <div className="card-body">
          <div className="placeholder-glow">
            <h5 className="card-title placeholder col-8"></h5>
            <p className="card-text placeholder col-12"></p>
            <p className="card-text placeholder col-10"></p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        {loading ? (
          <>
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </>
        ) : (
          blogs.length > 0 ? (
            blogs.map(blog => {
              const coverImage = blog.imageUrl || extractFirstImage(blog.content) || placeholderImage;
              return (
                <div className="col-md-4 mb-4" key={blog._id}>
                  <div className="card h-100 shadow-sm">
                    <img 
                      src={coverImage} 
                      className="card-img-top" 
                      alt={blog.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = placeholderImage;
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{blog.title}</h5>
                      <div 
                        className="card-text text-muted flex-grow-1" 
                        dangerouslySetInnerHTML={{ __html: blog.content.substring(0, 100) + '...' }}
                      />
                      <Link 
                        to={`/blog/${blog._id}`} 
                        className="btn btn-outline-primary mt-auto align-self-start"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                No blog posts available. Check back later!
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default BlogList;
