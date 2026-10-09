import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const DISPLAY_MS = 5000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(1)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message, type = 'error') => {
    const id = nextId.current++
    setToasts((current) => [...current, { id, message, type }])
    setTimeout(() => dismiss(id), DISPLAY_MS)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-sm text-white ${
              toast.type === 'error' ? 'bg-red-700' : 'bg-green-700'
            }`}
          >
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => dismiss(toast.id)} aria-label="Dismiss message" className="font-bold leading-none">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
