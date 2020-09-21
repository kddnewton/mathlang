import React, { useCallback, useContext, useMemo, useState } from "react";

import useDismissable from "./useDismissable";

type Toast = {
  id: number,
  body: React.ReactNode
};

type ToastsContextValue = {
  toasts: Toast[],
  onToastCreate: (body: React.ReactNode) => void,
  onToastDismiss: (toast: Toast) => void
};

const ToastContext = React.createContext<ToastsContextValue>({
  toasts: [],
  onToastCreate: () => {},
  onToastDismiss: () => {}
});

export const useToasts = () => useContext(ToastContext);

type ToastAlertProps = {
  toast: Toast
};

const ToastAlert: React.FC<ToastAlertProps> = ({ toast }) => {
  const { onToastDismiss } = useToasts();

  const [toastRef, onTriggerDismiss] = useDismissable<HTMLDivElement>(
    useCallback(() => onToastDismiss(toast), [onToastDismiss, toast])
  );

  return (
    <div role="alert" aria-live="assertive" aria-atomic="true" className="toast dismissable-show" ref={toastRef}>
      <svg viewBox="0 0 24 24" aria-hidden="true" width="1.2rem" height="1.2rem" className="toast--status">
        <path
          fill="currentColor"
          d="M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z"
        />
      </svg>
      {toast.body}
      <button type="button" aria-label="Dismiss" onClick={onTriggerDismiss} className="toast--dismiss">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
};

const Toasts: React.FC = () => {
  const { toasts } = useToasts();

  return (
    <div aria-live="polite" aria-atomic="true" className="toasts">
      {toasts.map((toast) => (
        <ToastAlert key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

let toastId = 0;
const getNextToastId = () => ++toastId;

export const ToastsProvider: React.FC = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo(
    () => ({
      toasts,
      onToastCreate(body: React.ReactNode) {
        setToasts((current) => [...current, { id: getNextToastId(), body }])
      },
      onToastDismiss(toast: Toast) {
        setToasts((current) => current.filter((value) => value.id !== toast.id));
      }
    }),
    [toasts, setToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toasts />
    </ToastContext.Provider>
  );
};
