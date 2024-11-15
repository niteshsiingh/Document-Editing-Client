import React from 'react';
import { EditorState, ContentState } from 'draft-js';

interface TableControlsProps {
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
}

const TableControls: React.FC<TableControlsProps> = ({
  editorState,
  setEditorState,
}) => {
  const isTableSelected = () => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getAnchorKey();
    const block = contentState.getBlockForKey(blockKey);
    if (block.getType() !== 'atomic') return false;

    const entityKey = block.getEntityAt(0);
    if (!entityKey) return false;

    const entity = contentState.getEntity(entityKey);
    return entity.getType() === 'TABLE';
  };

  const modifyTable = (modifyFn: (entityData: any) => any) => {
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const blockKey = selection.getAnchorKey();
    const block = contentState.getBlockForKey(blockKey);
  
    if (block.getType() !== 'atomic') return;
  
    const entityKey = block.getEntityAt(0);
    if (!entityKey) return;
  
    const entity = contentState.getEntity(entityKey);
    if (entity.getType() !== 'TABLE') return;
  
    const entityData = entity.getData();
  
    const newEntityData = modifyFn(entityData);
  
    const contentStateWithEntity = contentState.mergeEntityData(
      entityKey,
      newEntityData
    );
  
    // Push the new content state with a 'change-block-data' type
    let newEditorState = EditorState.push(
      editorState,
      contentStateWithEntity,
      'apply-entity'
    );
  
    // Force the editor to recognize the change by updating the selection
    newEditorState = EditorState.forceSelection(
      newEditorState,
      newEditorState.getSelection()
    );
  
    setEditorState(newEditorState);
  };

  const addRow = () => {
    modifyTable((entityData) => {
      const { rows, cols, data } = entityData;
      const newData = data ? [...data] : [];
      const newRow = new Array(cols).fill('');
      newData.push(newRow);
      return {
        ...entityData,
        rows: rows + 1,
        data: newData,
      };
    });
  };

  const addColumn = () => {
    modifyTable((entityData) => {
      const { rows, cols, data } = entityData;
      const newData = data
        ? data.map((row: string[]) => [...row, ''])
        : [];

      if (newData.length === 0) {
        for (let i = 0; i < rows; i++) {
          newData.push(new Array(cols + 1).fill(''));
        }
      }

      return {
        ...entityData,
        cols: cols + 1,
        data: newData,
      };
    });
  };

  const tableSelected = isTableSelected();

  return (
    <div className="table-controls">
      <button
        onClick={addRow}
        disabled={!tableSelected}
        className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        Add Row
      </button>
      <button
        onClick={addColumn}
        disabled={!tableSelected}
        className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        Add Column
      </button>
    </div>
  );
};

export default TableControls;