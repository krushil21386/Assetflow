import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: "SUCCESS" | "INFO" | "WARNING" | "ERROR";
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { user } = useAuth();

  const addToast = (title: string, message: string, type: ToastMessage["type"] = "INFO") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Only connect when user is logged in
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = "http://localhost:5000";
    const socketInstance = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected to backend server");
    });

    socketInstance.on("disconnect", () => {
      console.log("[Socket] Disconnected from backend server");
    });

    // Real-time listener for user notifications
    socketInstance.on("notification:created", (notification: any) => {
      if (notification.userId === user.id) {
        addToast(notification.title, notification.message, notification.type || "INFO");
      }
    });

    // System-wide live notifications for allocation, transfer and maintenance
    socketInstance.on("allocation:created", () => {
      addToast(
        "Resource Allocated",
        `Asset has been successfully allocated to an employee.`,
        "SUCCESS"
      );
    });

    socketInstance.on("allocation:returned", () => {
      addToast(
        "Resource Returned",
        `Allocated asset was returned back to inventory.`,
        "INFO"
      );
    });

    socketInstance.on("maintenance:created", () => {
      addToast(
        "Maintenance Raised",
        `A new maintenance request has been submitted.`,
        "WARNING"
      );
    });

    socketInstance.on("transfer:requested", () => {
      addToast(
        "Transfer Requested",
        `A department asset transfer request has been initiated.`,
        "INFO"
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  // Styling maps for the beautiful premium notification banners
  const typeStyles = {
    SUCCESS: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/30 dark:text-emerald-300",
    INFO: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800/30 dark:text-blue-300",
    WARNING: "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800/30 dark:text-amber-300",
    ERROR: "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800/30 dark:text-rose-300",
  };

  const iconName = {
    SUCCESS: "check_circle",
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
  };

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start p-4 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 animate-[slideIn_0.2s_ease-out] ${typeStyles[toast.type]}`}
          >
            <span className="material-symbols-outlined mr-3 mt-0.5 text-[22px]">
              {iconName[toast.type]}
            </span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm leading-snug">{toast.title}</h4>
              <p className="text-xs mt-1 opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </SocketContext.Provider>
  );
};
