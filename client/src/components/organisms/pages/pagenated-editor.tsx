import React, { useEffect, useRef, useState } from 'react';
import {
  Editor,
  EditorState,
  ContentBlock,
  ContentState,
  CompositeDecorator,
} from 'draft-js';

interface PaginatedEditorProps {
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  editorRef: React.RefObject<Editor>;
  onChange: (state: EditorState) => void;
  handleKeyCommand: (
    command: string,
    editorState: EditorState
  ) => 'handled' | 'not-handled';
  focusEditor: () => void;
  styleMap: any;
  blockRendererFn: (block: ContentBlock) => any;
  orientation: 'portrait' | 'landscape';
  margin: number;
  headerContent: string;
  footerContent: string;
}

const PaginatedEditor: React.FC<PaginatedEditorProps> = ({
  editorState,
  editorRef,
  onChange,
  handleKeyCommand,
  styleMap,
  blockRendererFn,
  orientation,
  margin,
  headerContent,
  footerContent,
}) => {
  const [pages, setPages] = useState<EditorState[]>([]);
  const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    // Calculate block heights
    const heights: { [key: string]: number } = {};
    Object.keys(blockRefs.current).forEach((key) => {
      const ref = blockRefs.current[key];
      if (ref) {
        heights[key] = ref.getBoundingClientRect().height;
      }
    });

    // Paginate content using the calculated heights
    paginateContent(heights);
  }, [editorState, orientation, margin]); // Dependencies that affect layout

  const paginateContent = (blockHeights: { [key: string]: number }) => {
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const blocks = blockMap.toArray();

    const pageHeight =
      (orientation === 'portrait' ? 1100 : 850) - margin * 2 - 100; // Adjust for margins and header/footer
    let pagesArray: ContentBlock[][] = [];
    let currentPage: ContentBlock[] = [];
    let accumulatedHeight = 0;

    blocks.forEach((block) => {
      const blockHeight = blockHeights[block.getKey()] || 300; // Default to 24px
      if (accumulatedHeight + blockHeight > pageHeight) {
        pagesArray.push(currentPage);
        currentPage = [block];
        accumulatedHeight = blockHeight;
      } else {
        currentPage.push(block);
        accumulatedHeight += blockHeight;
      }
    });

    if (currentPage.length > 0) {
      pagesArray.push(currentPage);
    }

    const decorator = new CompositeDecorator([]);

    const newPages = pagesArray.map((blocks) => {
      const newContentState = ContentState.createFromBlockArray(blocks);
      return EditorState.createWithContent(newContentState, decorator);
    });

    setPages(newPages);
  };

  return (
    <div>
      {/* Editable Editor
      <div style={{ marginBottom: '20px' }}>
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={styleMap}
          blockRendererFn={blockRendererFn}
        />
      </div> */}

      {/* Hidden container for measuring block heights */}
      {/* <div style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0 }}>
        {editorState
          .getCurrentContent()
          .getBlockMap()
          .toSeq()
          .map((block) => {
            const key = block!.getKey();
            return (
              <div key={key} ref={(ref) => (blockRefs.current[key] = ref)}>
                <Editor
                  editorState={EditorState.createWithContent(
                    ContentState.createFromBlockArray([block!])
                  )}
                  customStyleMap={styleMap}
                  blockRendererFn={blockRendererFn}
                  onChange={onChange}
                  // readOnly
                />
              </div>
            );
          })
          .toArray()}
      </div> */}

      {/* Paginated View */}
      {pages.map((pageEditorState, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            height: orientation === 'portrait' ? '1100px' : '850px',
            width: orientation === 'portrait' ? '850px' : '1100px',
            margin: '0 auto',
            marginBottom: '20px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
            padding: `${margin}px`,
          }}
        >
          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: `${margin}px`,
              left: `${margin}px`,
              right: `${margin}px`,
              height: '50px',
            }}
          >
            {/* {headerContent} */}
          </div>

          {/* Editor Content */}
          <div
            style={{
              position: 'absolute',
              top: `${margin + 50}px`,
              bottom: `${margin + 50}px`,
              left: `${margin+20}px`,
              right: `${margin+20}px`,
              overflow: 'hidden',
            }}
          >
            <Editor
                ref={editorRef}
                editorState={editorState}
                onChange={onChange}
                handleKeyCommand={handleKeyCommand}
                customStyleMap={styleMap}
                blockRendererFn={blockRendererFn}
              />
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: `${margin}px`,
              left: `${margin}px`,
              right: `${margin}px`,
              height: '50px',
            }}
          >
            {/* {footerContent} */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaginatedEditor;