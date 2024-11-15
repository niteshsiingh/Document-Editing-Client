import React from 'react';
import { ContentBlock, ContentState, EditorState } from 'draft-js';
import TableBlock from './table-block';
import ImageComponent from '../image';

interface BlockRendererProps {
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  focusEditor: () => void;
}

export const blockRendererFn = (
  contentBlock: ContentBlock,
  { editorState, setEditorState, focusEditor }: BlockRendererProps
) => {
  if (contentBlock.getType() === 'atomic') {
    const contentState = editorState.getCurrentContent();
    const entityKey = contentBlock.getEntityAt(0);
    if (entityKey) {
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'TABLE') {
        return {
          component: TableBlock,
          editable: false,
          props: {
            editorState,
            setEditorState,
            focusEditor,
          },
        };
      } else if (entity.getType() === 'IMAGE') {
        return {
          component: ImageComponent,
          editable: false,
          props: {
            editorState,
            setEditorState,
            focusEditor,
          },
        };
      }
    }
  }
  return null;
};