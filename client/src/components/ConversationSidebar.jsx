import { C } from "../styles/tokens";

function formatDate(iso) {
  var d = new Date(iso);
  var now = new Date();
  var diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  if (diff < 604800000) return Math.floor(diff / 86400000) + "d ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ConversationSidebar({ conversations, activeId, onSwitch, onNew, onDelete }) {
  return (
    <div style={{
      width: 260, borderRight: "1px solid " + C.border, background: C.s1,
      display: "flex", flexDirection: "column", height: "100%",
      flexShrink: 0,
    }}>
      <div style={{
        padding: "14px 16px", borderBottom: "1px solid " + C.border,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.t1 }}>Conversations</span>
        <button onClick={onNew} style={{
          width: 28, height: 28, borderRadius: 7, border: "1px solid " + C.border,
          background: C.s2, color: C.t2, fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
        }}>+</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
        {conversations.map(function (conv) {
          var isActive = conv.id === activeId;
          var msgCount = conv.messages.filter(function (m) { return m.role === "user"; }).length;

          return (
            <div key={conv.id}
              onClick={function () { onSwitch(conv.id); }}
              style={{
                padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                marginBottom: 2, transition: "all 0.1s",
                background: isActive ? C.accentDim : "transparent",
                border: "1px solid " + (isActive ? C.accent + "30" : "transparent"),
              }}
              onMouseEnter={function (e) { if (!isActive) e.currentTarget.style.background = C.s2; }}
              onMouseLeave={function (e) { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{
                  fontSize: 12, fontWeight: isActive ? 600 : 500,
                  color: isActive ? C.accent : C.t1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1, marginRight: 8,
                }}>
                  {conv.title}
                </div>
                <button
                  onClick={function (e) { e.stopPropagation(); onDelete(conv.id); }}
                  style={{
                    width: 20, height: 20, borderRadius: 4, border: "none",
                    background: "transparent", color: C.t4, fontSize: 12,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, opacity: 0.5,
                  }}
                  onMouseEnter={function (e) { e.target.style.opacity = "1"; e.target.style.color = C.red; }}
                  onMouseLeave={function (e) { e.target.style.opacity = "0.5"; e.target.style.color = C.t4; }}
                >✕</button>
              </div>
              <div style={{ fontSize: 10, color: C.t3, marginTop: 3 }}>
                {formatDate(conv.date)}{msgCount > 0 ? " · " + msgCount + " messages" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}