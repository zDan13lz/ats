import { useState, useEffect } from "react";
import * as storage from "../utils/storage";

export function useChat() {
  const [messages, setMessages] = useState([]);

  // Load on mount
  useEffect(() => {
    const saved = storage.get("chat");
    if (saved) setMessages(saved);
  }, []);

  // Save on change
  useEffect(() => {
    if (messages.length > 0) {
      // Only save completed messages, not streaming ones
      const toSave = messages
        .filter((m) => !m.streaming)
        .slice(-50); // Keep last 50 messages max
      storage.set("chat", toSave);
    }
  }, [messages]);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const updateLast = (update) => {
    setMessages((prev) => {
      const copy = [...prev];
      if (copy.length > 0) copy[copy.length - 1] = { ...copy[copy.length - 1], ...update };
      return copy;
    });
  };

  const clearChat = () => {
    setMessages([]);
    storage.remove("chat");
  };

  return { messages, setMessages, addMessage, updateLast, clearChat };
}