import { useUserStore } from '@/store';
import type { DramaTaskCenter } from '@/types/modules/ai/drama';

export interface DramaTaskSocketOptions {
  onSnapshot: (snapshot: DramaTaskCenter) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export interface DramaTaskSocketClient {
  connect: () => void;
  refresh: () => void;
  close: () => void;
}

interface TaskCenterSocketMessage {
  type: 'TASK_CENTER_SNAPSHOT';
  payload: DramaTaskCenter;
}

export function createDramaTaskSocket(options: DramaTaskSocketOptions): DramaTaskSocketClient {
  let socket: WebSocket | undefined;
  let reconnectTimer: number | undefined;
  let closedByUser = false;
  let reconnectAttempts = 0;

  function connect() {
    closedByUser = false;
    if (socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) {
      return;
    }
    const wsUrl = buildTaskCenterWsUrl();
    socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      reconnectAttempts = 0;
      options.onOpen?.();
      refresh();
    };
    socket.onmessage = (event) => handleMessage(event.data);
    socket.onerror = () => {
      // WebSocket 握手失败时浏览器不会暴露完整响应体，这里至少保留目标地址方便排查网关/服务路由。
      console.warn('[DramaTaskSocket] WebSocket 连接失败：', wsUrl);
      options.onError?.();
    };
    socket.onclose = () => {
      options.onClose?.();
      if (!closedByUser) {
        scheduleReconnect();
      }
    };
  }

  function refresh() {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send('refresh');
    }
  }

  function close() {
    closedByUser = true;
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
    socket?.close();
    socket = undefined;
  }

  function scheduleReconnect() {
    if (reconnectTimer) {
      return;
    }
    const delay = Math.min(1000 * 2 ** reconnectAttempts, 15000);
    reconnectAttempts += 1;
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = undefined;
      connect();
    }, delay);
  }

  function handleMessage(data: string) {
    const message = JSON.parse(data) as TaskCenterSocketMessage;
    if (message.type === 'TASK_CENTER_SNAPSHOT') {
      options.onSnapshot(message.payload);
    }
  }

  return { connect, refresh, close };
}

function buildTaskCenterWsUrl() {
  const userStore = useUserStore();
  const prefix = import.meta.env.VITE_API_URL_PREFIX || '/api';
  const tokenQuery = userStore.token ? `?token=${encodeURIComponent(userStore.token)}` : '';
  const endpoint = `${prefix}/ai/drama/ws/tasks${tokenQuery}`;

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint.replace(/^http/i, 'ws');
  }
  const url = new URL(endpoint, window.location.origin);
  url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}
