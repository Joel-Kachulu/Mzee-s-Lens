import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner, Alert, Container, Card } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const BlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    const plainText = quillRef.current?.getEditor().getText() || '';
    setWordCount(plainText.trim().split(/\s+/).length);
  }, [content]);

  // Load existing blog if in edit mode
  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const res = await api.get(`/api/blogs/${id}`);
          const blog = res.data;
          setTitle(blog.title);
          setTags(blog.tags || '');
          setContent(blog.content);
          setExistingImageUrl(blog.coverImage || '');
        } catch (err) {
          setError('Failed to load blog data.');
        }
      })();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('tags', tags);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      if (isEditMode) {
        await api.put(`/api/blogs/${id}`, formData);
        setSuccess('Blog updated successfully!');
      } else {
        await api.post('/api/blogs/', formData);
        setSuccess('Blog posted successfully!');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(isEditMode ? 'Failed to update blog.' : 'Failed to post blog.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverImage(file);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <Container className="my-5">
      <Card className="p-4 shadow-sm">
        <h2 className="mb-4 text-center">
          {isEditMode ? 'Edit Blog' : 'Create New Blog'}
        </h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group controlId="formTitle" className="mb-3">
            <Form.Label><strong>Title</strong></Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter blog title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group controlId="formTags" className="mb-3">
            <Form.Label><strong>Tags / Categories</strong></Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. tech, life, coding"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formContent" className="mb-3">
            <Form.Label><strong>Content</strong></Form.Label>
            <ReactQuill
              ref={quillRef}
              value={content}
              onChange={setContent}
              modules={modules}
              theme="snow"
              style={{ height: '300px' }}
            />
            <small className="text-muted d-block mt-2">Word Count: {wordCount}</small>
          </Form.Group>

          <Form.Group controlId="formCoverImage" className="mb-3">
            <Form.Label><strong>Cover Image</strong></Form.Label>
            <Form.Control type="file" onChange={handleImageUpload} />
            {existingImageUrl && !coverImage && (
              <div className="mt-2">
                <small className="text-muted">Current Image:</small><br />
                <img src={existingImageUrl} alt="cover" style={{ maxWidth: '100%', height: 'auto' }} />
              </div>
            )}
          </Form.Group>

          <div className="d-grid">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading
                ? <Spinner animation="border" size="sm" />
                : isEditMode
                ? 'Update Blog'
                : 'Post Blog'}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
};

export default BlogForm;
