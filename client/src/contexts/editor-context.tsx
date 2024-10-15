import {
    EditorState,
    Editor,
    Modifier,
    convertFromRaw,
    RawDraftContentState,
    convertToRaw,
    DraftHandleValue,
  } from 'draft-js';
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
  import { FONTS } from '../components/atoms/font-select';
  import useAuth from '../hooks/use-auth';
  import { BASE_URL } from '../services/api';
  import SocketEvent from "../types/enums/socket-events-enum";
  import DocumentInterface from '../types/interfaces/document';
  import { DocumentContext } from './document-context';
  import { ToastContext } from './toast-context';
  const LSeqTree = require('lseqtree');
  let socket:Socket;
  // socket = io(BASE_URL);
  

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
    setCurrentFont: Dispatch<SetStateAction<string>>;
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
    setCurrentFont: () => {},
  };
  
  export const EditorContext =
    createContext<EditorContextInterface>(defaultValues);
  
  interface EditorProviderInterface {
    children: JSX.Element;
  }
  
  // const DEFAULT_SAVE_TIME = 1500;
  // let saveInterval: null | NodeJS.Timeout = null;
  // let IdArray: Array<any> = [];
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
    const editorRef = useRef<null | Editor>(defaultValues.editorRef);
    const [currentFont, setCurrentFont] = useState(defaultValues.currentFont);
    const [IdArray, setIdArray] = useState<Array<any>>([]);
    const [isConnected, setIsConnected] = useState(false);
  
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
      const selectionState = newState.getSelection();
      const start = selectionState.getStartOffset();
  
      if (oldContentState !== newContentState) {
        const key = selectionState.getStartKey();
        const block = newContentState.getBlockForKey(key);
        const character = block.getText().charAt(start - 1);
        // console.log('Adding character:', character, 'at index:', start - 1);
        let id=insertElement(character, start - 1);
        setIdArray([...IdArray,{id:id,operation:0}]);
      }
  
      setEditorState(newState);
    };
    const handleKeyCommand = (command:string , editorState: EditorState) => {
      const selectionState = editorState.getSelection();
      const start = selectionState.getStartOffset();
      const end = selectionState.getEndOffset();
      const currentContent = editorState.getCurrentContent();
      if (command === 'delete' || command === 'backspace') {
        // console.log('Deleting characters at:', { start, end });
        for (let i = start-1; i < end; i++) {
          const key = selectionState.getStartKey();
          const block = currentContent.getBlockForKey(key);
          const character = block.getText().charAt(i);
          // console.log('Deleting character:', character, 'at index:', i);
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
          // console.log('Deleting character at:', start - 1);
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
          // console.log('Deleting character at:', start);
        }
        return 'handled';
      }
  
      return 'not-handled';
    };

    // useEffect(() => {
    //   if (documentRendered || document === null)
    //     return;
    //   try {
    //     console.log("123: ",document)
    //     const contentState = convertFromRaw(
    //       JSON.parse("123") as RawDraftContentState
    //     );
    //     const newEditorState = EditorState.createWithContent(contentState);
    //     setEditorState(newEditorState);
    //   } catch {
    //     error('Error when loading document.');
    //   } finally {
    //     setDocumentRendered(true);
    //   }
    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [document]);
    useEffect(() => {
      if (documentRendered || document === null || accessToken === null) return;
    
      const fetchAndInsertIds = async () => {
        try {
          // Fetch IDs from the API
          const response = await DocumentService.listId(accessToken,document.ID);
          const idArray=response.data.data;
          // Start with the current editor state
          let currentEditorState = editorState;
          if (idArray!==null){
          for (let i = 0; i < idArray.length; i++) {
            const index = insertElementById(idArray[i])-1;
            // console.log('Inserting character:',index, idArray[i]);
    
            const key = currentEditorState.getSelection().getStartKey();
    
            // Create a new selection at the desired index
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
              idArray[i].elem
            );
    
            // Push the new content state to the editor state
            currentEditorState = EditorState.push(
              currentEditorState,
              newContentState,
              'insert-characters'
            );
          }}
    
          // Set the final editor state
          setEditorState(currentEditorState);
        } catch (err) {
          error('Error when loading and inserting document IDs.');
        } finally {
          setDocumentRendered(true);
        }
      };
    
      fetchAndInsertIds();
    
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken,document]);
  
    // Connect socket
    useEffect(() => {
      socket = io.connect("ws://localhost:3000", {
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
        console.log('Connected to server');
      });
      
      socket.on('disconnect', (reason) => {
        disconnectSocket();
        setIsConnected(false);
        console.log('Disconnected:', reason);
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
          // console.log('Emitting changes:', IdArray);
          socket.emit("receive-changes" , IdArray);
          setIdArray([]);
        }
      };
      const interval = setInterval(emitChanges, 3000);
      
      return () => {
        clearInterval(interval);
      };
    
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [IdArray, accessToken]);

    // Disconnect socket
    useEffect(() => {
      return () => {
        console.log('Disconnecting socket');
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
          // console.log('Inserting character:', idArray[i].id);
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
          setEditorState,
          setDocumentRendered,
          onChange,
          handleKeyCommand,
          focusEditor,
          setCurrentFont,
        }}
      >
        {children}
      </EditorContext.Provider>
    );
  };