import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner, Alert, Container, Card } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, { type: file.type });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          file.type,
          0.8
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const BlogForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [slug, setslug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState<number>(0);
  const [existingImageUrl, setExistingImageUrl] = useState('');

  const navigate = useNavigate();
  const quillRef = useRef<ReactQuill | null>(null);

  useEffect(() => {
    const plainText = quillRef.current?.getEditor().getText() || '';
    setWordCount(plainText.trim().split(/\s+/).filter(Boolean).length);
  }, [content]);

  useEffect(() => {
    if (isEditMode) {
      (async () => {
        try {
          const res = await api.get(`/api/blogs/${id}`);
          const blog = res.data;
          setTitle(blog.title);
          setslug(blog.slug || '');
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

  if (!isEditMode && !coverImage) {
    setError('Cover image is required for new blog posts.');
    setLoading(false);
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  if (coverImage) formData.append('coverImage', coverImage);
  if (isEditMode) formData.append('slug', slug);

  try {
    if (isEditMode) {
      await api.put(`/api/blogs/${id}`, formData);
      setSuccess('Blog updated successfully!');
    } else {
      await api.post('/api/blogs/', formData);  // <- This should now work correctly
      setSuccess('Blog posted successfully!');
    }
    setTimeout(() => navigate('/admin/dashboard'), 1500);
  } catch (err: any) {
    console.error(err);
    setError(isEditMode ? 'Failed to update blog.' : 'Failed to post blog.');
  } finally {
    setLoading(false);
  }
};


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedFile = await resizeImage(file, 800, 600);
        setCoverImage(resizedFile);
      } catch (err) {
        console.error('Error resizing image:', err);
        setError('Failed to process image. Please try another one.');
      }
    }
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

          {isEditMode && (
            <Form.Group controlId="formSlug" className="mb-3">
              <Form.Label><strong>Slug</strong></Form.Label>
              <Form.Control
                type="text"
                placeholder="Slug (optional)"
                value={slug}
                onChange={(e) => setslug(e.target.value)}
              />
            </Form.Group>
          )}

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
            <Form.Control
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              required={!isEditMode}
            />
            <small className="text-muted">Images will be automatically resized to optimal dimensions</small>
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
