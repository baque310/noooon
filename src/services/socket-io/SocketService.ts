import { io, Socket } from "socket.io-client";

type SocketConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface AdminData {
  userId: string;
  userType: "ADMIN" | "MANAGER";
  schoolId: string;
}

interface SocketError {
  message: string;
  code?: string;
}

class AdminSocketService {
  private socket: Socket | null = null;
  private connectionStatus: SocketConnectionStatus = "disconnected";
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  get isConnected(): boolean {
    return this.connectionStatus === "connected";
  }

  get status(): SocketConnectionStatus {
    return this.connectionStatus;
  }

  connect(token: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.connectionStatus = "connecting";

    this.socket = io(`wss://wl-v1-dev-api.noon-iraq.com/chat`, {
      transports: ["websocket"],
      upgrade: false,
      auth: { token },
      extraHeaders: { Authorization: `Bearer ${token}` },
      query: { token },
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  register(adminData: AdminData): void {
    if (!this.socket?.connected) {
      console.warn("Socket not connected. Cannot register admin.");
      return;
    }

    this.socket.emit("register", adminData);
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to socket:", this.socket?.id);
      this.connectionStatus = "connected";
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Socket disconnected:", reason);
      this.connectionStatus = "disconnected";

      if (reason === "io server disconnect") {
        this.handleReconnect();
      }
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      this.connectionStatus = "error";
      this.handleReconnect();
    });

    this.socket.on("error", (error: SocketError) => {
      console.error("Socket error:", error);
      this.connectionStatus = "error";
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, 2000 * this.reconnectAttempts);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = "disconnected";
      this.reconnectAttempts = 0;
    }
  }
}

export default new AdminSocketService();
