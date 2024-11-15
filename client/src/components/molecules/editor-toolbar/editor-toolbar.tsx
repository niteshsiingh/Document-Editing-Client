import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/outline';
import { EditorState } from 'draft-js';
import { useContext } from 'react';
import { EditorContext } from '../../../contexts/editor-context';
import IconButton from '../../atoms/icon-button';
import FontSelect from '../../atoms/font-select';
import { TextFormatToolbar } from '../../atoms/text-format/text-format-toolbar';
import InsertTableButton from '../../atoms/table-block';

const EditorToolbar = () => {
  const { editorState, setEditorState } = useContext(EditorContext);

  const handleUndoBtnClick = () => {
    setEditorState(EditorState.undo(editorState));
  };

  const handleRedoBtnClick = () => {
    setEditorState(EditorState.redo(editorState));
  };

  return (
    <div className="w-full h-9 px-3 py-1 flex-shrink-0 flex items-center">
      <IconButton
        onClick={handleUndoBtnClick}
        icon={<ArrowLeftIcon className="h-4 w-4" />}
        tooltip="Undo"
      />
      <IconButton
        onClick={handleRedoBtnClick}
        icon={<ArrowRightIcon className="h-4 w-4" />}
        tooltip="Redo"
      />
      <div className="h-5 border-l border-l-gray-300 mx-2"></div>
      <FontSelect />
      <TextFormatToolbar 
        editorState={editorState}
        setEditorState={setEditorState}
      />
    </div>
  );
};

export const INLINE_STYLES = {
  BOLD: 'BOLD',
  ITALIC: 'ITALIC',
  UNDERLINE: 'UNDERLINE',
  CODE: 'CODE',
};

export const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 38, 46];

export const COLOR_STYLES = {
color_red: { color: 'rgba(255, 0, 0, 1.0)' },
color_blue: { color: 'rgba(0, 0, 255, 1.0)' },
color_green: { color: 'rgba(0, 255, 0, 1.0)' },
};

export default EditorToolbar;