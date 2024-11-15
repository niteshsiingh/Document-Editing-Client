import {
  EditorState,
  Editor,
  Modifier,
  convertFromRaw,
  RawDraftContentState,
  convertToRaw,
  DraftHandleValue,
  RichUtils,
  SelectionState,
} from 'draft-js';
import { OrderedSet } from 'immutable';
import {
  createContext,
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as io from 'socket.io-client';
import { Socket } from 'socket.io-client';
// import { io, Socket } from 'socket.io-client';
import DocumentService from '../services/document-service';
import { FONTS, FONTSIZES } from '../components/atoms/font-select';
import useAuth from '../hooks/use-auth';
import { BASE_URL } from '../services/api';
import SocketEvent from "../types/enums/socket-events-enum";
import DocumentInterface from '../types/interfaces/document';
import { DocumentContext } from './document-context';
import { ToastContext } from './toast-context';
import { COLOR_STYLES, FONT_SIZES } from '../components/atoms/text-format/style';

const LSeqTree = require('lseqtree');
let socket:Socket;
// socket = io(BASE_URL);

// let currentColor = '#bd1c1c';

interface EditorContextInterface {
  editorState: EditorState;
  setEditorState: Dispatch<SetStateAction<EditorState>>;
  documentRendered: boolean;
  setDocumentRendered: Dispatch<SetStateAction<boolean>>;
  editorRef: null | MutableRefObject<null | Editor>;
  onChange: (newState: EditorState) => void;
  handleKeyCommand: (command: string, editorState: EditorState) => DraftHandleValue;
  focusEditor: () => void;
  currentFont: string;
  currentFontSize: string;
  setCurrentFont: Dispatch<SetStateAction<string>>;
  setCurrentFontSize: Dispatch<SetStateAction<string>>;

  toggleInlineStyle: (style: string) => void;
  toggleFontFamily: (font: string) => void;
  toggleFontSize: (size: string) => void;
  styleMap: any;
  currentColor: string;
  setCurrentColor: Dispatch<SetStateAction<string>>;  
}
const t: DraftHandleValue = 'not-handled';

const defaultValues = {
  editorState: EditorState.createEmpty(),
  setEditorState: () => {},
  documentRendered: false,
  setDocumentRendered: () => {},
  editorRef: null,
  handleKeyCommand: () => t,
  onChange: () => {},
  focusEditor: () => {},
  currentFont: FONTS[0],
  currentFontSize: FONTSIZES[0],
  setCurrentFont: () => {},
  setCurrentFontSize: () => {},
  toggleInlineStyle: () => {},
  toggleFontFamily: () => {},
  toggleFontSize: () => {},
  styleMap: {},
  currentColor: '#000000',
  setCurrentColor: () => {},
};

export const styleMap = {
  ...COLOR_STYLES,
  ...Object.fromEntries(
    FONT_SIZES.map(size => [
      `fontsize-${size}`,
      { fontSize: `${size}px` }
    ])
  )
};

export const EditorContext =
  createContext<EditorContextInterface>(defaultValues);

interface EditorProviderInterface {
  children: JSX.Element;
}

const lseqTree = new LSeqTree();

const insertElement = (element: any, position: number) => {
  const idInsert = lseqTree.insert(element, position);
  return idInsert;
};

const insertElementById = (id: any) => {
  const idInsert = lseqTree.applyInsert(id, false);
  return idInsert;
}
const deleteElement = (position: number) => {
  const idDelete = lseqTree.remove(position);
  return idDelete;
};
const deleteElementById = (id: any) => {
  const idDelete = lseqTree.applyRemove(id);
  return idDelete;
}

export const EditorProvider = ({ children }: EditorProviderInterface) => {
  const [editorState, setEditorState] = useState(defaultValues.editorState);
  const [documentRendered, setDocumentRendered] = useState(
    defaultValues.documentRendered
  );
  const [currentColor, setCurrentColor] = useState('#000000');
  const editorRef = useRef<null | Editor>(defaultValues.editorRef);
  const [currentFont, setCurrentFont] = useState(defaultValues.currentFont);
  const [currentFontSize, setCurrentFontSize] = useState(defaultValues.currentFontSize);
  const [IdArray, setIdArray] = useState<Array<any>>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const [customStyleMap, setCustomStyleMap] = useState<Record<string, React.CSSProperties>>({
    // Font families
    ...Object.fromEntries(
      FONTS.map(font => [`fontfamily-${font}`, { fontFamily: font }])
    ),
    // Font sizes with 'px' units
    ...Object.fromEntries(
      FONTSIZES.map(size => [`fontsize-${size}`, { fontSize: `${size}px` }])
    ),
    // Colors
    ...COLOR_STYLES,
  });

  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleFontFamily = (font: string) => {
    const selection = editorState.getSelection();
    let contentState = editorState.getCurrentContent();
  
    // Remove existing font family styles
    FONTS.forEach((fontName) => {
      const style = `fontfamily-${fontName}`;
      contentState = Modifier.removeInlineStyle(contentState, selection, style);
    });
  
    // Apply new font family style
    contentState = Modifier.applyInlineStyle(contentState, selection, `fontfamily-${font}`);
  
    // Update editor state
    let newEditorState = EditorState.push(editorState, contentState, 'change-inline-style');
  
    // Set inline style override for new content
    const currentStyle = newEditorState.getCurrentInlineStyle();
    const styleOverride = currentStyle.add(`fontfamily-${font}`);
    newEditorState = EditorState.setInlineStyleOverride(newEditorState, styleOverride);
  
    setCurrentFont(font);
    setEditorState(newEditorState);
  };

  const toggleFontSize = (size: string) => {
    // Get current selection
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
  
    // Update state
    // setCurrentFontSize(size);
    setEditorState(nextState);
  };


  const { document, setCurrentUsers, setSaving, setDocument, saveDocument } =
    useContext(DocumentContext);
  const { error } = useContext(ToastContext);
  const { accessToken } = useAuth();

  const focusEditor = () => {
    if (editorRef === null || editorRef.current === null) return;
    editorRef.current.focus();
  };
  const onChange = (newState: EditorState) => {
    const oldContentState = editorState.getCurrentContent();
    const newContentState = newState.getCurrentContent();
    const selection = newState.getSelection();
    
    if (oldContentState !== newContentState) {
      let nextState = newState;
      let contentState = nextState.getCurrentContent();
      // Apply font family
      if (currentFont) {
        const fontStyle = `fontfamily-${currentFont}`;
        nextState = RichUtils.toggleInlineStyle(nextState, fontStyle);
      }
  
      // Apply font size without 'px' in the key
      if (currentFontSize) {
        const sizeStyle = `fontsize-${currentFontSize}`;
        
        // Get the last block and its text
        const blocks = contentState.getBlockMap();
        const lastBlock = blocks.last();
        const text = lastBlock.getText();
        const lastCharPos = text.length;
      
        if (lastCharPos > 0) {
          // Create selection for last character
          const lastCharSelection = SelectionState.createEmpty(lastBlock.getKey()).merge({
            anchorOffset: lastCharPos - 1,
            focusOffset: lastCharPos,
            hasFocus: true
          });
      
          // Apply style to last character
          contentState = Modifier.applyInlineStyle(
            contentState,
            lastCharSelection,
            sizeStyle
          );
        }
      
        // Apply style to current selection
        contentState = Modifier.applyInlineStyle(
          contentState,
          selection,
          sizeStyle
        );
      
        nextState = EditorState.push(nextState, contentState, 'change-inline-style');
        
        // Set style override for future characters
        const styleSet = nextState.getCurrentInlineStyle();
        const styleOverride = styleSet.add(sizeStyle);
        nextState = EditorState.setInlineStyleOverride(nextState, styleOverride);
        
        // Maintain original selection
        nextState = EditorState.forceSelection(nextState, selection);
      }
  
      // Apply color
      if (currentColor) {
        // Get the last block and its text
        const blocks = contentState.getBlockMap();
        const lastBlock = blocks.last();
        const text = lastBlock.getText();
        const lastCharPos = text.length;
      
        if (lastCharPos > 0) {
          // Create selection for last character
          const lastCharSelection = SelectionState.createEmpty(lastBlock.getKey()).merge({
            anchorOffset: lastCharPos - 1,
            focusOffset: lastCharPos,
            hasFocus: true
          });
      
          // Remove existing color styles from last character
          const currentStyles = nextState.getCurrentInlineStyle();
          currentStyles.forEach((style) => {
            if (style && style.startsWith('color-')) {
              contentState = Modifier.removeInlineStyle(contentState, lastCharSelection, style);
            }
          });
      
          // Apply new color to last character
          const colorStyle = `color-${currentColor.replace('#', '')}`;
          contentState = Modifier.applyInlineStyle(contentState, lastCharSelection, colorStyle);
        }
      
        // Apply color to current selection and set style override
        nextState = EditorState.push(nextState, contentState, 'change-inline-style');
        const styleSet = nextState.getCurrentInlineStyle();
        const colorStyle = `color-${currentColor.replace('#', '')}`;
        const styleOverride = styleSet.add(colorStyle);
        nextState = EditorState.setInlineStyleOverride(nextState, styleOverride);
        
        // Maintain original selection
        nextState = EditorState.forceSelection(nextState, selection);
      }
  
      // Continue with your existing code...
      const start = selection.getStartOffset();
      const key = selection.getStartKey();
      const block = contentState.getBlockForKey(key);
      const character = block.getText().charAt(start - 1);
      const elem = character+','+currentColor+','+currentFontSize+','+currentFont;
      let id = insertElement(elem, start - 1);
      setIdArray([...IdArray, { id: id, operation: 0 }]);

      setEditorState(nextState);
      // setEditorState(EditorState.forceSelection(nextState, nextState.getSelection()));
    } else {
      // Maintain styles even when content hasn't changed
      let nextState = newState;
      if (currentColor) {
        const colorStyle = `color-${currentColor.replace('#', '')}`;
        nextState = RichUtils.toggleInlineStyle(nextState, colorStyle);
      }
      // if (currentFontSize) {
        const fontStyle = `fontsize-${currentFontSize}`;
        const currentStyles = nextState.getCurrentInlineStyle();
        currentStyles.forEach((style) => {
          if (style && style.startsWith('fontsize-')) {
            nextState = RichUtils.toggleInlineStyle(nextState, style);
          }
        });
        nextState = RichUtils.toggleInlineStyle(nextState, fontStyle);
        setEditorState(nextState);
  
    }
  };
  const handleKeyCommand = (command:string , editorState: EditorState) => {
    const selectionState = editorState.getSelection();
    const start = selectionState.getStartOffset();
    const end = selectionState.getEndOffset();
    const currentContent = editorState.getCurrentContent();
    if (command === 'delete' || command === 'backspace') {
      for (let i = start-1; i < end; i++) {
        let id=deleteElement(i);
        setIdArray([...IdArray,{id:id,operation:1}]);
      }
      const newContentState = Modifier.removeRange(
        editorState.getCurrentContent(),
        selectionState,
        'backward'
      );
      setEditorState(
        EditorState.push(editorState, newContentState, 'remove-range')
      );
    }
    if (command === 'backspace') {
      if (start === end && start > 0) {
        const newContentState = Modifier.removeRange(
          currentContent,
          selectionState.merge({
            anchorOffset: start - 1,
            focusOffset: start
          }),
          'backward'
        );
        setEditorState(
          EditorState.push(editorState, newContentState, 'remove-range')
        );
      }
      return 'handled';
    }

    if (command === 'delete') {
      if (start === end) {
        const newContentState = Modifier.removeRange(
          currentContent,
          selectionState.merge({
            anchorOffset: start,
            focusOffset: start + 1
          }),
          'forward'
        );
        setEditorState(
          EditorState.push(editorState, newContentState, 'remove-range')
        );
      }
      return 'handled';
    }

    return 'not-handled';
  };
  useEffect(() => {
    setCustomStyleMap(prevMap => ({
      ...prevMap,
      [`color-${currentColor.replace('#', '')}`]: { color: currentColor }
    }));
  }, [currentColor]);

  useEffect(() => {
    setCustomStyleMap(prevMap => ({
      ...prevMap,
      [`fontsize-${currentFontSize}`]: { fontSize: `${currentFontSize}px` }
    }));
  }, [currentFontSize]);

  useEffect(() => {
    if (documentRendered || document === null || accessToken === null) return;
  
    const fetchAndInsertIds = async () => {
      try {
        // Fetch IDs from the API
        const response = await DocumentService.listId(accessToken, document.ID);
        const idArray = response.data.data;
  
        // Start with the current editor state
        let currentEditorState = editorState;
  
        if (idArray !== null) {
          for (let i = 0; i < idArray.length; i++) {
            const index = insertElementById(idArray[i]) - 1;
  
            const key = currentEditorState.getSelection().getStartKey();
  
            // Create a selection at the desired index
            const selectionState = SelectionState.createEmpty(key).merge({
              anchorOffset: index,
              focusOffset: index,
            });
  
            const elem = idArray[i].elem;
            const [character, color, fontSize, fontFamily] = elem.split(',');
  
            // Combine all styles into an OrderedSet
            // const colorStyle = `color-${currentColor.replace('#', '')}`;

            const colorStyleKey = `color-${color.replace('#', '')}`;
            const styles = OrderedSet.of(
              colorStyleKey,
              `fontsize-${fontSize}`,
              `fontfamily-${fontFamily}`
            );
  
            // Insert text with all styles applied
            const newContentState = Modifier.insertText(
              currentEditorState.getCurrentContent(),
              selectionState,
              character,
              styles
            );
  
            // Update the editor state with the new content state
            currentEditorState = EditorState.push(
              currentEditorState,
              newContentState,
              'insert-characters'
            );
            setCurrentColor(color);
            
          }
        }
  
        // Set the final editor state
        setCurrentColor("#000000");
        setEditorState(currentEditorState);
      } catch (err) {
        console.error('Error when loading and inserting document IDs.', err);
      } finally {
        setDocumentRendered(true);
      }
    };
  
    fetchAndInsertIds();
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, document]);

  // Connect socket
  useEffect(() => {
    if (!document || !document.ID) {
      console.warn('Document is not available yet.');
      return;
    }

    socket = io.connect("wss://document-editing-server.onrender.com", {
      query: {
        accessToken: accessToken,
        documentId: document?.ID,
      },
      transports: ['websocket'],
      // autoConnect: false,
    });
    // return () => {};
    const connectSocket = () => {
      if (!isConnected) {
        socket.connect();
      }
    };

    const disconnectSocket = () => {
      if (isConnected) {
        socket.disconnect();
      }
    };
    socket.on('connect', () => {
      if (isConnected) return;
      connectSocket();
      setIsConnected(true);
    });
    
    socket.on('disconnect', (reason) => {
      disconnectSocket();
      setIsConnected(false);
    });
    socket.emit("join", "room_"+document?.ID);
  },[accessToken,document?.ID]);

  useEffect(() => {
    if (
      IdArray === null ||
      accessToken === null ||
      socket === null
    )
    return;

    const emitChanges = () => {
      if (IdArray && IdArray.length > 0) {
        socket.emit("receive-changes" , IdArray);
        setIdArray([]);
      }
    };
    const interval = setInterval(emitChanges, 1000);
    
    return () => {
      clearInterval(interval);
    };
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IdArray, accessToken]);

  // Disconnect socket
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  socket?.off("receive-changes");
  socket?.on(SocketEvent.RECEIVE_CHANGES, (idArray: Array<any>) => {
  
    // Create a variable to keep track of the editor state
    let currentEditorState = editorState;
  
    for (let i = 0; i < idArray.length; i++) {
      if (idArray[i].operation === 0) {
        const index = insertElementById(idArray[i].id)-1;
        const key = currentEditorState.getSelection().getStartKey();
        const selectionState = currentEditorState.getSelection().merge({
          anchorKey: key,
          anchorOffset: index,
          focusKey: key,
          focusOffset: index,
        });
  
        // Create the new content state with the inserted text
        const newContentState = Modifier.insertText(
          currentEditorState.getCurrentContent(),
          selectionState,
          idArray[i].id.elem
        );
  
        // Push the new content state to the editor state
        currentEditorState = EditorState.push(
          currentEditorState,
          newContentState,
          'insert-characters'
        );
      } else {
        const index = deleteElementById(idArray[i].id);
        const key = currentEditorState.getSelection().getStartKey();
        // const block = currentEditorState.getCurrentContent().getBlockForKey(key);
        // const text = block.getText();
  
        // Create a new selection at the desired index
        const selectionState = currentEditorState.getSelection().merge({
          anchorKey: key,
          anchorOffset: index,
          focusKey: key,
          focusOffset: index,
        });
  
        // Create the new content state with the removed range
        const newContentState = Modifier.removeRange(
          currentEditorState.getCurrentContent(),
          selectionState,
          'backward'
        );
  
        // Push the new content state to the editor state
        currentEditorState = EditorState.push(
          currentEditorState,
          newContentState,
          'remove-range'
        );
      }
    }
  
    // Update the editor state once after the loop
    setEditorState(currentEditorState);
  });
  // Current users updated
  useEffect(() => {
    if (!socket) return;

    const handler = (currentUsers: Array<string>) => {
      setCurrentUsers(new Set<string>(currentUsers));
    };

    socket.on(SocketEvent.CURRENT_USERS_UPDATE, handler);

    return () => {
      socket.off(SocketEvent.CURRENT_USERS_UPDATE, handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return (
    <EditorContext.Provider
      value={{
        editorState,
        documentRendered,
        editorRef,
        
        currentFont,
        currentFontSize,
        setEditorState,
        setDocumentRendered,
        onChange,
        handleKeyCommand,
        focusEditor,
        setCurrentFont,
        setCurrentFontSize,
        toggleInlineStyle,
        toggleFontFamily,
        toggleFontSize,
        styleMap: customStyleMap,
        currentColor,
        setCurrentColor,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};