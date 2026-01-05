"use client";

import { useEffect, useRef } from "react";

// One shared entry per URL
const socketEntries = new Map();

function connect(entry, url) {
  const ws = new WebSocket(url);
  entry.ws = ws;

  ws.onopen = (event) => {
    entry.listeners.forEach((listener) => {
      listener.onOpenRef.current?.(event);
    });
  };

  ws.onclose = (event) => {
    entry.listeners.forEach((listener) => {
      listener.onCloseRef.current?.(event);
    });

    if (entry.shouldReconnect) {
      entry.reconnectTimeout = setTimeout(
        () => connect(entry, url),
        entry.reconnectDelay
      );
    }
  };

  ws.onerror = (event) => {
    entry.listeners.forEach((listener) => {
      listener.onErrorRef.current?.(event);
    });
    // Do not force-close here; let server decide
  };

  ws.onmessage = (event) => {
    entry.listeners.forEach((listener) => {
      listener.onMessageRef.current?.(event);
    });
  };
}

function ensureEntry(url, reconnectDelay) {
  let entry = socketEntries.get(url);
  if (!entry) {
    entry = {
      ws: null,
      reconnectDelay,
      listeners: new Set(),
      shouldReconnect: true,
      reconnectTimeout: null,
    };
    socketEntries.set(url, entry);
    connect(entry, url);
  } else {
    // Keep latest delay if changed
    entry.reconnectDelay = reconnectDelay;
  }
  return entry;
}

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
  const listenerRef = useRef({
    onMessageRef: { current: onMessage },
    onOpenRef: { current: onOpen },
    onCloseRef: { current: onClose },
    onErrorRef: { current: onError },
  });

  // Keep latest handlers in refs
  useEffect(() => {
    listenerRef.current.onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    listenerRef.current.onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    listenerRef.current.onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    listenerRef.current.onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!url) return;

    const entry = ensureEntry(url, reconnectDelay);
    entry.listeners.add(listenerRef.current);

    return () => {
      entry.listeners.delete(listenerRef.current);

      if (entry.listeners.size === 0) {
        entry.shouldReconnect = false;
        if (entry.reconnectTimeout) {
          clearTimeout(entry.reconnectTimeout);
        }
        if (entry.ws) {
          try {
            entry.ws.close();
          } catch {
            // ignore
          }
          entry.ws = null;
        }
        socketEntries.delete(url);
      }
    };
  }, [url, reconnectDelay]);
}
