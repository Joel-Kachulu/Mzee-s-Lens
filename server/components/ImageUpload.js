import React, { useState } from 'react';
import { Box, Label, Button } from '@adminjs/design-system';

const ImageUpload = (props) => {
  const { property, onChange, record } = props;
  const [imageUrl, setImageUrl] = useState(record.params[property.name] || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.file.url);
        onChange(property.name, data.file.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Create error message box manually since Message component isn't available
  const renderError = error ? React.createElement(
    'div',
    {
      style: {
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '16px',
        border: '1px solid #f5c6cb'
      }
    },
    error
  ) : null;

  return React.createElement(
    Box,
    null,
    React.createElement(Label, null, property.label),
    React.createElement('input', {
      type: 'file',
      id: `${property.name}-upload`,
      accept: 'image/*',
      onChange: handleFileChange,
      style: { display: 'none' }
    }),
    React.createElement(
      Box,
      { flex: true, alignItems: 'center', mb: 'lg' },
      React.createElement(
        Button,
        {
          as: 'label',
          htmlFor: `${property.name}-upload`,
          variant: 'primary',
          disabled: isUploading
        },
        isUploading ? 'Uploading...' : 'Upload Cover Image'
      ),
      imageUrl && React.createElement(
        Box,
        { ml: 'xl' },
        React.createElement(
          Button,
          {
            variant: 'text',
            onClick: () => {
              setImageUrl('');
              onChange(property.name, '');
            }
          },
          'Remove Image'
        )
      )
    ),
    renderError,
    imageUrl ? React.createElement(
      Box,
      null,
      React.createElement('img', {
        src: imageUrl,
        alt: 'Cover preview',
        style: { 
          maxWidth: '100%', 
          maxHeight: '200px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }
      }),
      React.createElement(
        Box,
        { mt: 'sm', fontSize: 'sm' },
        React.createElement('strong', null, 'Image URL:'),
        ' ',
        imageUrl
      )
    ) : React.createElement(
      Box,
      {
        style: {
          height: '200px',
          border: '2px dashed #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }
      },
      React.createElement('span', { style: { color: '#999' }}, 'No cover image selected')
    )
  );
};

export default ImageUpload;