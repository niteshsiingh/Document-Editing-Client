import { Editor } from 'draft-js';
import { useContext } from 'react';
import { EditorContext } from '../../../contexts/editor-context';

const DocumentEditor = () => {
  const { editorState, editorRef,onChange,handleKeyCommand, focusEditor } =
    useContext(EditorContext);

  return (
    <div
      style={{ height: '1100px', width: '850px' }}
      className="bg-white shadow-md flex-shrink-0 cursor-text p-12"
      onClick={focusEditor}
    >
      <Editor
        ref={editorRef}
        // editorState={editorState}
        // onChange={handleEditorChange}
        editorState={editorState}
        onChange={onChange}
        handleKeyCommand={handleKeyCommand}
      />
    </div>
  );
};

export default DocumentEditor;