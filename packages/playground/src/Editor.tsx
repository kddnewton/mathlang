import React, { useState, Dispatch, SetStateAction } from "react";
import { Editor as DraftEditor, EditorBlock, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";

export const useEditorState = () => (
  useState<EditorState>(() => EditorState.createEmpty())
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

type EditorProps = {
  editorState: EditorState,
  onChange: Dispatch<SetStateAction<EditorState>>
};

const Editor: React.FC<EditorProps> = ({ editorState, onChange }) => (
  <DraftEditor
    blockRendererFn={blockRendererFn}
    editorState={editorState}
    onChange={onChange}
  />
);

export default Editor;
