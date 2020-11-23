import React, { useRef, useState } from "react";

import { useToast } from "./Toast";

const copyToClipboard = (text: string): Promise<unknown> => {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  if (document.queryCommandSupported("copy") && document.queryCommandEnabled("copy")) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise((resolve, reject) => {
      if (document.execCommand("copy")) {
        resolve(null);
      } else {
        reject();
      }
    }).finally(() => {
      document.body.removeChild(textArea);
    });
  }

  return Promise.reject();
}

const CopyableButton: React.FC = ({ children }) => {
  const [copyFailed, setCopyFailed] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const { onToastCreate } = useToast();

  const onClick = () => {
    const button = buttonRef.current;

    if (button) {
      copyToClipboard(button.innerText)
        .then(() => onToastCreate("Copied to clipboard."))
        .catch(() => setCopyFailed(true));
    }
  };

  if (copyFailed) {
    return <>{children}</>;
  }

  return <button ref={buttonRef} type="button" onClick={onClick}>{children}</button>;
};

export default CopyableButton;
