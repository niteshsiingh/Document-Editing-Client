// TableBlock.tsx
import React, { useRef } from 'react';
import {
  ContentBlock,
  ContentState,
  EditorState,
  SelectionState,
} from 'draft-js';

interface TableBlockProps {
  block: ContentBlock;
  contentState: ContentState;
  blockProps: {
    editorState: EditorState;
    setEditorState: (state: EditorState) => void;
    focusEditor: () => void;
  };
}

const TableBlock: React.FC<TableBlockProps> = ({
  block,
  contentState,
  blockProps,
}) => {
  const { editorState, setEditorState, focusEditor } = blockProps;
  const entityKey = block.getEntityAt(0);
  const entity = contentState.getEntity(entityKey);
  const { rows, cols, data } = entity.getData();

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: rows }, () => Array(cols).fill(null))
  );

  const handleTableClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const blockKey = block.getKey();
    const selectionState = SelectionState.createEmpty(blockKey).merge({
      anchorOffset: 0,
      focusOffset: block.getLength(),
    }) as SelectionState;

    const newEditorState = EditorState.forceSelection(
      editorState,
      selectionState
    );
    setEditorState(newEditorState);
  };

  // Check if the table is selected
  const isSelected =
    editorState.getSelection().getAnchorKey() === block.getKey();

  // Handle cell changes
  const handleCellChange = (
    rowIndex: number,
    colIndex: number,
    text: string
  ) => {
    const newData = data.map((row: string[]) => [...row]);

    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }

    newData[rowIndex][colIndex] = text;

    const contentStateWithEntity = contentState.mergeEntityData(entityKey, {
      data: newData,
    });

    const newEditorState = EditorState.push(
      editorState,
      contentStateWithEntity,
      'change-block-data'
    );

    setEditorState(newEditorState);

    // Focus the next cell if needed
    if (colIndex + 1 < cols) {
      inputRefs.current[rowIndex][colIndex + 1]?.focus();
    } else if (rowIndex + 1 < rows) {
      inputRefs.current[rowIndex + 1][0]?.focus();
    }
  };

  const handleInputFocus = (rowIndex: number, colIndex: number) => {
    const input = inputRefs.current[rowIndex][colIndex];
    input?.focus();
  };

  const handleInputClick = (
    rowIndex: number,
    colIndex: number,
    event: React.MouseEvent<HTMLInputElement>
  ) => {
    handleTableClick(event);
    handleInputFocus(rowIndex, colIndex);
  };

  return (
    <div
      onClick={handleTableClick}
      style={{
        cursor: 'pointer',
        border: isSelected ? '2px solid black' : 'none',
        display: 'inline-block',
      }}
    >
      <table className="border-collapse border">
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: cols }, (_, colIndex) => (
                <td key={colIndex} className="border px-2 py-1">
                  <input
                    type="text"
                    value={data?.[rowIndex]?.[colIndex] || ''}
                    onChange={(e) =>
                      handleCellChange(rowIndex, colIndex, e.target.value)
                    }
                    onFocus={() => handleInputFocus(rowIndex, colIndex)}
                    onClick={(event) => handleInputClick(rowIndex, colIndex, event)}
                    ref={(el) => {
                      if (!inputRefs.current[rowIndex]) {
                        inputRefs.current[rowIndex] = [];
                      }
                      inputRefs.current[rowIndex][colIndex] = el;
                    }}
                    className="w-full"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlock;