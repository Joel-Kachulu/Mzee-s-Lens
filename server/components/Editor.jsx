import React, { useState, useEffect } from 'react';
import { Box, Label, Input } from '@adminjs/design-system';

const EditorJS = (props) => {
  const { property, record, onChange } = props;
  const [editor, setEditor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      const Quote = (await import('@editorjs/quote')).default;
      const Code = (await import('@editorjs/code')).default;
      
      const editorInstance = new EditorJS({
        holder: 'editorjs',
        tools: {
          header: Header,
          list: List,
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: '/api/upload-image',
              }
            }
          },
          quote: Quote,
          code: Code,
        },
        data: record.params.content || {},
        onChange: async () => {
          const content = await editorInstance.save();
          onChange(property.name, content);
        }
      });
      
      setEditor(editorInstance);
      setIsLoading(false);
    };
    
    initEditor();
    
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, []);

  return (
    <Box>
      <Label>{property.label}</Label>
      {isLoading ? (
        <p>Loading editor...</p>
      ) : (
        <div id="editorjs" style={{ background: 'white', padding: '10px' }} />
      )}
    </Box>
  );
};

export default EditorJS;