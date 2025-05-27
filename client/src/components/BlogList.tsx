import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Container, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AxiosError } from 'axios';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  content: string;
  ispublished: boolean;
  createdat: string;
  updatedat: string;
  video_url?: string | null;
}

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Memoized fallback component
  const FallbackImage = React.memo(() => (
    <div style={{
      width: '100%',
      height: '200px',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      borderBottom: '1px solid #eee'
    }}>
      No Cover Image
    </div>
  ));

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? 'Unknown date' 
        : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
    } catch {
      return 'Unknown date';
    }
  };

const stripHtmlTags = (html: string): string => {
const tmp = document.createElement("div");
tmp.innerHTML = html;
return tmp.textContent || tmp.innerText || "";
};


 const truncateContent = (content: string, length: number = 70) => {
  if (!content || typeof content !== 'string') return 'No content available';
  const plainText = stripHtmlTags(content);
  return plainText.length > length 
    ? plainText.substring(0, length) + '...' 
    : plainText;
};


  const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' && 
             parsed.hostname.includes('supabase.co') &&
             parsed.pathname.includes('/storage/v1/object/public/');
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchBlogs = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        const response = await api.get('/api/blogs/', { 
          signal: controller.signal 
        });
        
        if (!isMounted) return;

        if (!response.data) {
          throw new Error('Invalid response structure');
        }

        const rawData = Array.isArray(response.data) 
          ? response.data 
          : response.data?.blogs || [];

        const validatedBlogs = rawData.map((item: any) => ({
          id: item.id || 'unknown-id',
          title: typeof item.title === 'string' ? item.title : 'Untitled Blog',
          slug: typeof item.slug === 'string' ? item.slug : item.id || 'unknown-slug',
          excerpt: typeof item.excerpt === 'string' ? item.excerpt : truncateContent(item.content),
          coverImage: isValidImageUrl(item.coverImage) ? item.coverImage : null,
          content: typeof item.content === 'string' ? item.content : '',
          ispublished: Boolean(item.ispublished),
          createdat: item.createdat || new Date().toISOString(),
          updatedat: item.updatedat || new Date().toISOString(),
          video_url: typeof item.video_url === 'string' ? item.video_url : null
        }));

        if (isMounted) {
          setBlogs(validatedBlogs);
        }
      } catch (err) {
        if (!isMounted) return;
        
        if (err instanceof AxiosError && err.name === 'CanceledError') {
          console.log('Request canceled');
          return;
        }

        console.error('Fetch error:', err);
        setError('Failed to load blogs. ' + 
          (retryCount < 2 ? 'Retrying...' : 'Please check your connection.'));
        
        if (retryCount < 2 && isMounted) {
          setTimeout(() => setRetryCount(c => c + 1), 2000);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [retryCount]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.style.display = 'none';
    
    const fallback = document.createElement('div');
    fallback.style.width = '100%';
    fallback.style.height = '200px';
    fallback.style.backgroundColor = '#f5f5f5';
    fallback.style.display = 'flex';
    fallback.style.alignItems = 'center';
    fallback.style.justifyContent = 'center';
    fallback.style.color = '#666';
    fallback.textContent = 'Image not available';
    
    target.parentNode?.replaceChild(fallback, target);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setLoading(true);
  };

  if (loading && blogs.length === 0) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading blogs...</p>
      </Container>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center">
          {error}
          <div className="mt-3">
            <Button 
              variant="outline-danger" 
              onClick={handleRetry}
            >
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h1 className="mb-4">Latest Blog Posts</h1>
      
      {error && (
        <Alert variant="warning" className="mb-4">
          {error} Some content may not be available.
        </Alert>
      )}

      <Row xs={1} md={2} lg={3} className="g-4">
        {blogs.map(blog => (
          <Col key={blog.id} className="d-flex">
            <Card className="flex-grow-1 shadow-sm h-100">
              <Link to={`/blogdetail/${blog.id}`} className="text-decoration-none text-dark">
                <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      onError={handleImageError}
                      crossOrigin="anonymous"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <FallbackImage />
                  )}
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">
                      {formatDate(blog.createdat)}
                    </small>
                    {!blog.ispublished && (
                      <span className="badge bg-warning text-dark">Draft</span>
                    )}
                  </div>
                  <Card.Title>{blog.title}</Card.Title>
                  <Card.Text className="text-muted">
                    {stripHtmlTags(blog.excerpt || '')}
                  </Card.Text>
                </Card.Body>
              </Link>
              <Card.Footer className="bg-transparent border-top-0">
                <Link to={`/blogdetail/${blog.id}`} className="btn btn-primary btn-sm">
                  Read More
                </Link>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BlogList;



 