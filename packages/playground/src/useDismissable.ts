import React, { useCallback, useEffect, useRef, useState } from "react";

const timeoutMs = 5000;

const useDismissable = <T extends HTMLElement>(onDismiss: () => void): [React.RefObject<T>, () => void] => {
  const contentRef = useRef<T>(null);
  const [dismissed, setDismissed] = useState(false);

  const onTriggerDismiss = useCallback(() => setDismissed(true), [setDismissed]);

  useEffect(
    () => {
      const timeout = setTimeout(() => setDismissed(true), timeoutMs);
      return () => clearTimeout(timeout);
    },
    [setDismissed]
  );

  useEffect(
    () => {
      const node = contentRef.current;

      if (dismissed && node) {
        node.addEventListener("animationend", onDismiss);

        requestAnimationFrame(() => {
          node.classList.remove("dismissable-show");

          requestAnimationFrame(() => {
            node.classList.add("dismissable-hide");
          });
        });

        return () => node.removeEventListener("animationend", onDismiss);
      }
    },
    [contentRef, dismissed, onDismiss]
  );

  return [contentRef, onTriggerDismiss];
};

export default useDismissable;
