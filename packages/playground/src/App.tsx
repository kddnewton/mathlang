import React, { useState, Dispatch, SetStateAction } from "react";
import { evaluate } from "@mathlang/core";

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

type EditorState = {
  blocks: string[],
  line: number
};

type EditorProps = {
  state: EditorState,
  onChange: Dispatch<SetStateAction<EditorState>>
};

const Editor: React.FC<EditorProps> = ({ state, onChange }) => {
  const onKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!event.metaKey) {
      const { key } = event;

      switch (key) {
        case "Enter":
          onChange((current) => ({
            blocks: [
              ...current.blocks.slice(0, current.line + 1),
              "",
              ...current.blocks.slice(current.line + 1)
            ],
            line: current.line + 1
          }));
          break;
        default:
          onChange((current) => ({
            ...current,
            blocks: [
              ...current.blocks.slice(0, current.line),
              `${current.blocks[current.line]}${key}`,
              ...current.blocks.slice(current.line + 1)
            ]
          }));
          break;
      }
    }
  };

  return (
    <div className="editor" tabIndex={0} onKeyPress={onKeyPress}>
      {state.blocks.map((value, index) => (
        <div key={index}>
          <strong>{index + 1}</strong> {value}
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [editorState, setEditorState] = useState<EditorState>({ blocks: [""], line: 0 });
  const [result, setResult] = useState<number | null>(null);

  const onEvaluate = () => {
    console.log(editorState.blocks);
    setResult(evaluate(editorState.blocks.join("\n")));
  };

  return (
    <>
      <Nav onEvaluate={onEvaluate} />
      <Editor state={editorState} onChange={setEditorState} />
      Result: {result}
    </>
  );
};

export default App;
