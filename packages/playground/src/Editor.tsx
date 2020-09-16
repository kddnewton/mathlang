import React, { useState, Dispatch, SetStateAction } from "react";
import { Editor as DraftEditor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";

export const useEditorState = () => (
  useState<EditorState>(() => EditorState.createEmpty())
);

export const getEditorText = (editorState: EditorState) => (
  editorState.getCurrentContent().getPlainText("\n")
);

type EditorProps = {
  editorState: EditorState,
  onChange: Dispatch<SetStateAction<EditorState>>
};

const Editor: React.FC<EditorProps> = ({ editorState, onChange }) => (
  <DraftEditor editorState={editorState} onChange={onChange} />
);

export default Editor;
