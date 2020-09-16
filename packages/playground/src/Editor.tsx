import React, { useState, Dispatch, SetStateAction } from "react";
import { Editor as DraftEditor, ContentState, EditorBlock, EditorState, KeyBindingUtil, getDefaultKeyBinding } from "draft-js";
import "draft-js/dist/Draft.css";

const defaultText = `f(x) = 2x
g(x) = x^2 + 1

f(g(5)) / 2
`;

export const useEditorState = () => (
  useState<EditorState>(() => (
    EditorState.createWithContent(ContentState.createFromText(defaultText))
  ))
);

export const getEditorText = (editorState: EditorState) => (
  editorState.getCurrentContent().getPlainText("\n")
);

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
  const handleKeyCommand = (command: string) => {
    if (command === "evaluate") {
      onEvaluate();
      return "handled";
    }
    return "not-handled";
  };

  return (
    <DraftEditor
      blockRendererFn={blockRendererFn}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={keyBindingFn}
      editorState={editorState}
      onChange={onChange}
    />
  );
};

export default Editor;
