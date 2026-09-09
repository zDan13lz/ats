import { useState, useEffect } from "react";
import * as storage from "../utils/storage";

export function useConversations() {
  var _convos = useState([]);
  var conversations = _convos[0], setConversations = _convos[1];
  var _active = useState(null);
  var activeId = _active[0], setActiveId = _active[1];

  useEffect(function () {
    var saved = storage.get("conversations");
    if (saved && saved.length > 0) {
      setConversations(saved);
      setActiveId(saved[0].id);
    } else {
      var first = {
        id: "conv_" + Date.now(),
        title: "New Chat",
        date: new Date().toISOString(),
        messages: [],
      };
      setConversations([first]);
      setActiveId(first.id);
      storage.set("conversations", [first]);
    }
  }, []);

  function save(updated) {
    setConversations(updated);
    storage.set("conversations", updated.map(function (c) {
      return { id: c.id, title: c.title, date: c.date, messages: c.messages.slice(-100) };
    }));
  }

  function createNew() {
    var conv = {
      id: "conv_" + Date.now(),
      title: "New Chat",
      date: new Date().toISOString(),
      messages: [],
    };
    var updated = [conv].concat(conversations);
    save(updated);
    setActiveId(conv.id);
    return conv;
  }

  function getActive() {
    if (!activeId) return null;
    for (var i = 0; i < conversations.length; i++) {
      if (conversations[i].id === activeId) return conversations[i];
    }
    return null;
  }

  function updateMessages(convId, messages) {
    var updated = conversations.map(function (c) {
      if (c.id !== convId) return c;

      var title = c.title;
      if (title === "New Chat" && messages.length > 0) {
        var firstUser = null;
        for (var i = 0; i < messages.length; i++) {
          if (messages[i].role === "user") { firstUser = messages[i]; break; }
        }
        if (firstUser) {
          title = firstUser.text.slice(0, 40);
          if (firstUser.text.length > 40) title += "...";
        }
      }

      return Object.assign({}, c, { messages: messages, title: title, date: new Date().toISOString() });
    });
    save(updated);
  }

  function switchTo(id) {
    setActiveId(id);
  }

  function deleteConversation(id) {
    var updated = conversations.filter(function (c) { return c.id !== id; });
    if (updated.length === 0) {
      var fresh = {
        id: "conv_" + Date.now(),
        title: "New Chat",
        date: new Date().toISOString(),
        messages: [],
      };
      updated = [fresh];
      setActiveId(fresh.id);
    } else if (activeId === id) {
      setActiveId(updated[0].id);
    }
    save(updated);
  }

  return {
    conversations: conversations,
    activeId: activeId,
    active: getActive(),
    createNew: createNew,
    switchTo: switchTo,
    updateMessages: updateMessages,
    deleteConversation: deleteConversation,
  };
}