// InsertTableButton.tsx
import React, { useContext } from 'react';
import { EditorContext } from '../../../contexts/editor-context';
import { AtomicBlockUtils, EditorState } from 'draft-js';

const InsertTableButton: React.FC = () => {
  const { editorState, setEditorState } = useContext(EditorContext);

  const insertTable = (rows = 3, cols = 4) => {
    const contentState = editorState.getCurrentContent();

    // Create an entity for the table
    const contentStateWithEntity = contentState.createEntity('TABLE', 'MUTABLE', {
      rows,
      cols,
      data: [],
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newEditorState = EditorState.push(
      editorState,
      contentStateWithEntity,
      'apply-entity'
    );

    // Insert an atomic block with the table entity
    const editorStateWithTable = AtomicBlockUtils.insertAtomicBlock(
      newEditorState,
      entityKey,
      ' '
    );

    setEditorState(editorStateWithTable);
  };

  return (
    <button onClick={() => insertTable()} 
    className="flex justify-center items-center text-xs text-gray-600 px-2 h-7 space-x-4 font-medium hover:bg-gray-100 rounded">
      Insert Table
    </button>
  );
};

export default InsertTableButton;