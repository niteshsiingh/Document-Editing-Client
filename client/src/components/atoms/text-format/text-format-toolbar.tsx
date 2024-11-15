// TextFormatToolbar.tsx
import React, { useContext, useRef, useState, useEffect } from 'react';
import { EditorState, RichUtils, Modifier, AtomicBlockUtils, SelectionState } from 'draft-js';
import { INLINE_STYLES, FONT_SIZES, COLOR_STYLES } from './style';
import { EditorContext, styleMap } from '../../../contexts/editor-context';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { CSSTransition } from 'react-transition-group';
import { TableControls } from '../tables';
import InsertTableButton from '../table-block';

interface TextFormatToolbarProps {
  editorState: EditorState;
  setEditorState: (editorState: EditorState) => void;
}

export const TextFormatToolbar: React.FC<TextFormatToolbarProps> = ({
  editorState,
  setEditorState,
}) => {
  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentFontSize, setCurrentFontSize } = useContext(EditorContext);
  const { currentColor, setCurrentColor } = useContext(EditorContext);
  const dropdownRef = useRef(null);
  const [isTableSelected, setIsTableSelected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Added ref for file input

  const toggleFontSize = (size: string) => {
    setCurrentFontSize(size);
    const selection = editorState.getSelection();
    let contentState = editorState.getCurrentContent();

    // Remove existing font size styles
    const currentStyles = editorState.getCurrentInlineStyle();
    currentStyles.forEach((style) => {
      if (style && style.startsWith('fontsize-')) {
        contentState = Modifier.removeInlineStyle(contentState, selection, style);
      }
    });

    // Apply new font size style
    const newSizeStyle = `fontsize-${size}`;
    contentState = Modifier.applyInlineStyle(contentState, selection, newSizeStyle);

    // Create new editor state
    let nextState = EditorState.push(
      editorState,
      contentState,
      'change-inline-style'
    );

    // Set style override for future characters
    const styleSet = nextState.getCurrentInlineStyle();
    const styleOverride = styleSet.add(newSizeStyle);
    nextState = EditorState.setInlineStyleOverride(nextState, styleOverride);

    // Maintain selection
    nextState = EditorState.forceSelection(nextState, selection);

    setEditorState(nextState);
  };

  useEffect(() => {
      console.log("Updated font size:", currentFontSize);
  }, [currentFontSize]);

  useEffect(() => {
    if (!editorState) {
      setIsTableSelected(false);
      return;
    }

    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const blockKey = selectionState.getAnchorKey();
    const block = contentState.getBlockForKey(blockKey);

    if (block) {
      if (block.getType() === 'atomic') {
        const entityKey = block.getEntityAt(0);
        if (entityKey) {
          const entity = contentState.getEntity(entityKey);
          if (entity.getType() === 'TABLE') {
            setIsTableSelected(true);
            return;
          }
        }
      }
    }

    setIsTableSelected(false);
  }, [editorState]);

  const toggleColor = (color: string) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    let nextEditorState = editorState;

    // Remove other color styles
    currentStyle.toArray().forEach((style) => {
      if (style && style.startsWith('color-')) {
        nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, style);
      }
    });
    // Add new color style
    const colorStyle = `color-${color.replace('#', '')}`;
    nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, colorStyle);

    setCurrentColor(color);
    setEditorState(nextEditorState);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      insertImage(file);
    } else {
      alert('Please select a valid image file.');
    }
    
    // Reset the input value to allow uploading the same image again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertImage = (file: File) => {
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const src = event.target?.result;
      if (typeof src === 'string') {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src, width: 300, height: 200, x: 0, y: 0 });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  
        let newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
  
        // Insert the atomic block
        newEditorState = AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
  
        // Move focus after the image
        const selection = newEditorState.getSelection();
        const newSelection = selection.merge({
          anchorOffset: selection.getAnchorOffset() + 1,
          focusOffset: selection.getFocusOffset() + 1,
          isBackward: false,
        }) as SelectionState;
  
        newEditorState = EditorState.forceSelection(newEditorState, newSelection);
  
        setEditorState(newEditorState);
      }
    };
  
    reader.readAsDataURL(file);
  };

  return (
    <div 
      onBlur={() => setShowDropdown(false)}
      className="relative flex justify-center items-center"
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Bold Button */}
      <button
        onClick={() => toggleInlineStyle(INLINE_STYLES.BOLD)}
        className={`flex justify-between items-center text-xs text-gray-600 px-2 h-7 space-x-4 font-medium hover:bg-gray-100 rounded ${
          editorState.getCurrentInlineStyle().has(INLINE_STYLES.BOLD) ? 'bg-gray-200 font-bold' : 'font-bold'
        }`}
      >
        B
      </button>

      <button
        onClick={() => toggleInlineStyle(INLINE_STYLES.UNDERLINE)}
        className={`flex justify-between items-center text-xs text-gray-600 px-2 h-7 space-x-4 font-medium hover:bg-gray-100 rounded ${
          editorState.getCurrentInlineStyle().has(INLINE_STYLES.UNDERLINE) ? 'bg-gray-200 underline' : 'underline'
        }`}
      >
        U
      </button>
      
      {/* Italic Button */}
      <button
        onClick={() => toggleInlineStyle(INLINE_STYLES.ITALIC)}
        className={`flex justify-between items-center text-xs text-gray-600 px-2 h-7 space-x-4 font-medium hover:bg-gray-100 rounded italic ${
          editorState.getCurrentInlineStyle().has(INLINE_STYLES.ITALIC) ? 'bg-gray-200' : ''
        }`}
        >
        I
      </button>

      {/* Font Size Dropdown */}
      <div
        onBlur={() => setShowDropdown(false)}
        className="relative flex justify-center items-center"
      >
        <button
          onMouseOver={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex justify-between items-center text-xs text-gray-600 px-2 h-7 space-x-4 hover:bg-gray-100 rounded"
          >
          <span>{currentFontSize}px</span>
          <ChevronDownIcon className="w-3 h-3" />
        </button>
        {showTooltip && !showDropdown && (
          <div className="absolute top-full flex-col flex items-center">
            <div className="arrow-up border-b-gray-700"></div>
            <div className="relative -top-[1px] bg-gray-700 text-white text-xs font-medium py-1 px-4 rounded-sm">
              Font Size
            </div>
          </div>
        )}
        <CSSTransition
          nodeRef={dropdownRef}
          in={showDropdown}
          timeout={200}
          classNames="fade-in"
          unmountOnExit
          children={
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 z-10 w-52 bg-white py-0.5 rounded-sm shadow-lg border text-sm"
            >
              {FONT_SIZES.map((size) => (
                <div
                  key={size}
                  onClick={() => toggleFontSize(size.toString())}
                  className="w-full text-black hover:bg-gray-100 text-sm px-2 py-0.5 text-left cursor-pointer"
                >
                  {size}px
                </div>
              ))}
            </div>
          }
        />
      </div>

      {/* Color Picker */}
      <div className="color-picker flex items-center gap-2">
        <input
          type="color"
          value={currentColor}
          onChange={(e) => toggleColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-none"
          style={{
            backgroundColor: 'transparent',
            appearance: 'none',
            WebkitAppearance: 'none'
          }}
          />
        <span 
          className="inline-block w-6 h-6 rounded border border-gray-200"
          style={{ backgroundColor: currentColor }}
          />
      </div>
      
      {/* Insert Table Button */}
      <InsertTableButton />
      
      {/* Insert Image Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex justify-center items-center text-xs text-gray-600 px-2 h-7 space-x-4 font-medium hover:bg-gray-100 rounded"
      >
        Insert Image
      </button>

      {/* Table Controls (if a table is selected) */}
      {isTableSelected && (
        <TableControls
            editorState={editorState}
            setEditorState={setEditorState}
          />
      )}
    </div>
  );
};