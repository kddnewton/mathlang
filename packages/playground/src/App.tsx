import React, { useState } from "react";
import { evaluate } from "@mathlang/core";

import Editor, { getEditorText, useEditorState } from "./Editor";

type NavProps = {
  onEvaluate: () => void
};

const Nav: React.FC<NavProps> = ({ onEvaluate }) => (
  <nav className="nav">
    <h1>mathlang</h1>
    <button type="button" title="Evaluate" onClick={onEvaluate}>
      <svg width="34" height="34">
        <path d="M 11 9 L 24 16 L 11 23 z"></path>
      </svg>
    </button>
  </nav>
);

const App: React.FC = () => {
  const [editorState, onChange] = useEditorState();
  const [result, setResult] = useState<number | null>(null);

  const onEvaluate = () => {
    setResult(evaluate(getEditorText(editorState)));
  };

  return (
    <>
      <Nav onEvaluate={onEvaluate} />
      <Editor editorState={editorState} onChange={onChange} />
      Result: {result}
    </>
  );
};

export default App;
