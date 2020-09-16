import React, { useState } from "react";
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

type EditorProps = {
  value: string,
  onChange: (value: string) => void
};

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const onInput = (event: React.FormEvent<HTMLDivElement>) => {
    onChange(event.currentTarget.textContent || "");
  };

  return (
    <div contentEditable onInput={onInput}>
      {value}
    </div>
  );
};

const App: React.FC = () => {
  const [source, setSource] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const onEvaluate = () => setResult(evaluate(source));

  return (
    <>
      <Nav onEvaluate={onEvaluate} />
      <Editor value={source} onChange={setSource} />
      Result: {result}
    </>
  );
};

export default App;
