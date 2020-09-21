import React, { useRef, useState, Dispatch, SetStateAction } from "react";
import { Editor as DraftEditor, ContentState, EditorBlock, EditorState, KeyBindingUtil, SelectionState, getDefaultKeyBinding } from "draft-js";
import "draft-js/dist/Draft.css";

export const getEditorText = (editorState: EditorState) => (
  editorState.getCurrentContent().getPlainText("\n")
);

export const useEditorState = (initial: string): [EditorState, Dispatch<SetStateAction<EditorState>>] => {
  const [editorState, onChange] = useState<EditorState>(() => {
    const current = EditorState.createWithContent(ContentState.createFromText(initial));

    const blockMap = current.getCurrentContent().getBlockMap();
    const key = blockMap.last().getKey();
    const length = blockMap.last().getLength();

    const selection = new SelectionState({
      anchorKey: key,
      anchorOffset: length,
      focusKey: key,
      focusOffset: length
    });
  
    return EditorState.forceSelection(current, selection);
  });

  return [editorState, onChange];
};

type LineProps = React.ComponentProps<typeof EditorBlock>;

const Line: React.FC<LineProps> = ({ block, contentState, ...props })=> {
  const lineNumber = contentState.getBlockMap().toList().findIndex((item: { key: number }) => item.key === block.key) + 1;

  return (
    <div className="line" data-line-number={lineNumber}>
      <div className="line-text">
        <EditorBlock block={block} contentState={contentState} {...props} />
      </div>
    </div>
  );
};

const blockRendererFn = () => ({ component: Line });

const keyBindingFn = (event: React.KeyboardEvent) => {
  if (event.key === "Enter" && KeyBindingUtil.hasCommandModifier(event)) {
    return "evaluate";
  }
  return getDefaultKeyBinding(event);
};

type EditorProps = {
  editorState: EditorState,
  onChange: Dispatch<SetStateAction<EditorState>>,
  onEvaluate: () => void
};

const Editor: React.FC<EditorProps> = ({ editorState, onChange, onEvaluate }) => {
  const editorRef = useRef<DraftEditor>(null);
  const [focused, setFocused] = useState(false);

  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);
  const onClick = () => {
    const editor = editorRef.current;

    if (editor && !focused) {
      editor.focus();
    }
  };

  const handleKeyCommand = (command: string) => {
    if (command === "evaluate") {
      onEvaluate();
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div className="editor" onClick={onClick}>
      <DraftEditor
        blockRendererFn={blockRendererFn}
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={keyBindingFn}
        onBlur={onBlur}
        onChange={onChange}
        onFocus={onFocus}
        ref={editorRef}
      />
    </div>
  );
};

export default Editor;
