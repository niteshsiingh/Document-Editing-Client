// ImageComponent.tsx
import React from 'react';
import {
  ContentBlock,
  ContentState,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
import { Rnd } from 'react-rnd';
import { AiOutlineClose } from 'react-icons/ai';
import './ImageComponent.css';

interface ImageComponentProps {
  block: ContentBlock;
  contentState: ContentState;
  blockProps: {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    focusEditor: () => void;
  };
}

const ImageComponent: React.FC<ImageComponentProps> = ({
  block,
  contentState,
  blockProps,
}) => {
  const entity = contentState.getEntity(block.getEntityAt(0));
  const { src, width: initialWidth, height: initialHeight } = entity.getData();

  const [dimensions, setDimensions] = React.useState<{
    width: number;
    height: number;
  }>({
    width: initialWidth || 300,
    height: initialHeight || 200,
  });

  const updateEntityData = (newWidth: number, newHeight: number) => {
    const entityKey = block.getEntityAt(0);
    const contentState = blockProps.editorState.getCurrentContent();
    const contentStateWithUpdatedEntity = contentState.mergeEntityData(
      entityKey,
      {
        width: newWidth,
        height: newHeight,
      }
    );
    const newEditorState = EditorState.push(
      blockProps.editorState,
      contentStateWithUpdatedEntity,
      'apply-entity'
    );
    blockProps.setEditorState(newEditorState);
  };

  const removeImage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();
  
    const { editorState, setEditorState, focusEditor } = blockProps;
    const contentState = editorState.getCurrentContent();
    const blockKey = block.getKey();
  
    // Remove the block from the content state
    const blockMap = contentState.getBlockMap().delete(blockKey);
    const newContentState = contentState.merge({
      blockMap,
      selectionAfter: contentState.getSelectionAfter(),
    }) as ContentState;
  
    // Push the new content state into a new editor state
    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      'remove-range'
    );
  
    // Update the selection to the previous block or collapse at the end
    const previousBlockKey = contentState.getKeyBefore(blockKey);
    let selectionKey = previousBlockKey;
    let selectionOffset = contentState.getBlockForKey(previousBlockKey)?.getLength() || 0;
  
    if (!selectionKey) {
      // No previous block, select the next block
      const nextBlockKey = contentState.getKeyAfter(blockKey);
      selectionKey = nextBlockKey;
      selectionOffset = 0;
    }
  
    const newSelection = SelectionState.createEmpty(selectionKey).merge({
      anchorOffset: selectionOffset,
      focusOffset: selectionOffset,
    }) as SelectionState;
  
    const editorStateWithSelection = EditorState.forceSelection(
      newEditorState,
      newSelection
    );
  
    setEditorState(editorStateWithSelection);
    focusEditor();
  };

  return (
    <div className="image-component-container">
      {/* Prevent react-rnd from consuming events */}
      <Rnd
        size={{ width: dimensions.width, height: dimensions.height }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidth = parseInt(ref.style.width, 10);
          const newHeight = parseInt(ref.style.height, 10);
          setDimensions({ width: newWidth, height: newHeight });
          updateEntityData(newWidth, newHeight);
        }}
        enableResizing={{
          bottomRight: true,
        }}
        disableDragging
        bounds="parent"
        className="image-rnd"
        enableUserSelectHack={false} // Add this prop
      >
        <div
          className="image-wrapper"
          onMouseDown={(e) => e.stopPropagation()} // Prevent event blocking
        >
          <img
            src={src}
            alt="Inserted"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: '4px',
            }}
          />
          <button className="delete-button" onClick={removeImage}>
            <AiOutlineClose size={16} />
          </button>
        </div>
      </Rnd>
    </div>
  );
};

export default ImageComponent;