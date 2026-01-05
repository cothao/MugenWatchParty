"use client";

import { useEffect, useRef } from "react";

export function useReconnectingWebSocket(
  url,
  {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectDelay = 3000,
  } = {}
) {
  const wsRef = useRef(null);
  const shouldReconnectRef = useRef(true);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = (event) => {
        onOpen?.(event);
      };

      ws.onclose = (event) => {
        onClose?.(event);
        if (shouldReconnectRef.current) {
          reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
        }
      };

      ws.onerror = (event) => {
        onError?.(event);
        try {
          ws.close();
        } catch {
          // ignore
        }
      };

      ws.onmessage = (event) => {
        onMessage?.(event);
      };
    }

    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // ignore
        }
        wsRef.current = null;
      }
    };
  }, [url, reconnectDelay, onMessage, onOpen, onClose, onError]);

  return wsRef;
}
