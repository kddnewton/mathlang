import React, { useState } from "react";
import { evaluate, parse, Nodes } from "@mathlang/core";

import Editor, { getEditorText, useEditorState } from "./Editor";
import { ToastProvider, useToast } from "./Toast";
import Plot from "./Plot";
import CopyableButton from "./CopyableButton";

const GitHubLink = () => (
  <aside className="github-link">
    <svg width="40" height="40" viewBox="0 0 250 250">
      <a href="https://github.com/kddeisz/mathlang" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository">
        <path d="M0 0l115 115h15l12 27 108 108V0z" fill="#868e96" />
        <path d="M128 109c-15-9-9-19-9-19 3-7 2-11 2-11-1-7 3-2 3-2 4 5 2 11 2 11-3 10 5 15 9 16" fill="#ffffff" style={{ transformOrigin: "130px 106px" }} />
        <path d="M115 115s4 2 5 0l14-14c3-2 6-3 8-3-8-11-15-24 2-41 5-5 10-7 16-7 1-2 3-7 12-11 0 0 5 3 7 16 4 2 8 5 12 9s7 8 9 12c14 3 17 7 17 7-4 8-9 11-11 11 0 6-2 11-7 16-16 16-30 10-41 2 0 3-1 7-5 11l-12 11c-1 1 1 5 1 5z" fill="#ffffff" />
      </a>
    </svg>
  </aside>
);

type NavProps = {
  onEvaluate: () => void,
  onSave: () => void
};

const Nav: React.FC<NavProps> = ({ onEvaluate, onSave }) => (
  <nav className="nav">
    <button type="button" title="Evaluate" onClick={onEvaluate}>
      <svg viewBox="5 5 24 24">
        <path d="M 11 9 L 24 16 L 11 23 z"></path>
      </svg>
    </button>
    <button type="button" title="Save" onClick={onSave}>
      <svg viewBox="-50 -50 548 612">
        <path
          d="M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"
          strokeWidth="24"
        />
      </svg>
    </button>
  </nav>
);

const storage = {
  get() {
    return location.hash ? decodeURI(location.hash.slice(1)) : "";
  },
  set(value: string) {
    history.pushState(null, document.title, `#${encodeURI(value)}`);
  }
};

const Content: React.FC = () => {
  const [editorState, onChange] = useEditorState(storage.get());
  const { onToastCreate } = useToast();

  const onEvaluate = () => {
    onToastCreate(evaluate(getEditorText(editorState)));
  };

  const onSave = () => {
    storage.set(getEditorText(editorState));
    onToastCreate(<>Saved link: <CopyableButton>{document.location.toString()}</CopyableButton></>);
  };

  const [plot, setPlot] = useState<Nodes.Define | null>(null);

  return (
    <div className="content">
      <Nav onEvaluate={onEvaluate} onSave={onSave} />
      <Editor
        editorState={editorState}
        onChange={onChange}
        onEvaluate={onEvaluate}
        onPlot={setPlot}
      />
      {plot && <Plot define={plot} />}
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <GitHubLink />
    <Content />
  </ToastProvider>
);

export default App;
