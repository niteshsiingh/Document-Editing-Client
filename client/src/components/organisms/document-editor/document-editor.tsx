// DocumentEditor.tsx
import React, { useContext, useState } from 'react';
import { ContentBlock } from 'draft-js';
import { EditorContext } from '../../../contexts/editor-context';
import { blockRendererFn } from '../../atoms/table-block/blockRendererFn';
import PaginatedEditor from './../pages/pagenated-editor';

const DocumentEditor = () => {
  const {
    editorState,
    setEditorState,
    editorRef,
    onChange,
    handleKeyCommand,
    focusEditor,
    styleMap,
  } = useContext(EditorContext);

  // Wrap blockRendererFn to pass editorState and setEditorState
  const customBlockRenderer = (contentBlock: ContentBlock) => {
    return blockRendererFn(contentBlock, { editorState, setEditorState, focusEditor });
  };

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(50); // Margin in pixels
  const [headerContent, setHeaderContent] = useState('Header'); // Example header content
  const [footerContent, setFooterContent] = useState('Footer'); // Example footer content

  return (
    <div
    className="bg-white shadow-md flex-shrink-0 cursor-text"
    onClick={() => editorRef?.current?.focus()}
    style={{ overflow: 'auto' }}
    >
      <PaginatedEditor
        editorState={editorState}
        setEditorState={setEditorState}
        editorRef={editorRef!}
        onChange={onChange}
        handleKeyCommand={handleKeyCommand}
        focusEditor={focusEditor}
        styleMap={styleMap}
        blockRendererFn={customBlockRenderer}
        orientation={orientation}
        margin={margin}
        headerContent={headerContent}
        footerContent={footerContent}
      />
    </div>
  );
};

export default DocumentEditor;