import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Container, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Blog {
  id: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  createdat: string;
}

const truncateText = (text: string, wordLimit: number) => {
  if (!text) return 'No excerpt available.';
  return text.split(' ').slice(0, wordLimit).join(' ') + '...';
};

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get('/api/blogs/');
        const rawData = Array.isArray(response.data) ? response.data : response.data.blogs || [];

        const normalizedBlogs = rawData.map((blog: any) => ({
          id: blog._id || blog.id,
          title: blog.title,
          excerpt: blog.excerpt || blog.content?.slice(0, 80) || null,
          coverImage: blog.coverImage || null,
          createdat: blog.createdat,
        }));

        setBlogs(normalizedBlogs);
      } catch (err) {
        setError('Failed to fetch blogs.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {blogs.map((blog) => (
          <Col key={blog.id}>
            <Card className="h-100 shadow-sm">
              <Card.Img
                variant="top"
                src={blog.coverImage || 'https://via.placeholder.com/600x400?text=No+Image'}
                alt={blog.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/600x400?text=Image+Error';
                }}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <Card.Body>
                <small className="text-muted d-block mb-2">
                  {new Date(blog.createdat).toLocaleDateString()}
                </small>
                <Card.Title>{blog.title}</Card.Title>
                <Card.Text
                  dangerouslySetInnerHTML={{
                    __html: truncateText(blog.excerpt || '', 25),
                  }}
                />
                <Link to={`/blogdetail/${blog.id}`} className="btn btn-primary btn-sm">
                  Read More
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BlogList;