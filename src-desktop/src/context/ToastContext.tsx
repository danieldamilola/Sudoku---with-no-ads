import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Toast { id: number; icon: string; message: string; }
interface ToastCtx { showToast: (icon: string, message: string) => void; }

const Ctx = createContext<ToastCtx>({ showToast: () => {} });
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(Ctx);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const showToast = useCallback((icon: string, message: string) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, icon, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <Ctx.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" role="status" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} className="toast">
              <span className="toast-icon">{t.icon}</span>
              <span>{t.message}</span>
              <button className="toast-dismiss" type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss">✕</button>
            </div>
          ))}
        </div>
      )}
    </Ctx.Provider>
  );
};
