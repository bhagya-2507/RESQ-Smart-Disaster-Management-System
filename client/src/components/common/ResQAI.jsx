import { useEffect, useRef, useState } from "react";

function ResQAI() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm ResQ AI. I can help you with disaster safety, first-aid guidance, emergency information, and your rescue request status.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const getAIResponse = async (text) => {
  const token = localStorage.getItem("resq_token");

  try {
    const response = await fetch(
      "https://resq-smart-disaster-management-system.onrender.com/api/ai/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to contact ResQ AI."
      );
    }

    return data.reply;
  } catch (error) {
    return (
      "I'm unable to connect to the ResQ emergency intelligence service right now. " +
      "If this is an immediate emergency, please call 112."
    );
  }
};
  const sendMessage = async (text = message) => {
  const cleanText = text.trim();

  if (!cleanText || loading) return;

  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: cleanText,
    },
  ]);

  setMessage("");
  setLoading(true);

  const response = await getAIResponse(cleanText);

  setMessages((prev) => [
    ...prev,
    {
      sender: "ai",
      text: response,
    },
  ]);

  setLoading(false);
};
if (!open) {
  return (
    <button
      type="button"
      className="resq-ai-toggle"
      onClick={() => setOpen(true)}
      aria-label="Open ResQ AI"
    >
      🤖
      <span>ResQ AI</span>
    </button>
  );
}
  return (
    <div className="resq-ai-widget">

      {/* HEADER */}

      <div className="resq-ai-header">

        <div className="resq-ai-brand">

          <div className="resq-ai-avatar">
            🤖
          </div>

          <div>
            <strong>ResQ AI</strong>

            <small>
              Emergency Companion
            </small>
          </div>

        </div>

        <div className="resq-ai-online">
          <span></span>
          Online
        </div>

        <button
          className="resq-ai-close"
          onClick={() => setOpen(false)}
        >
          ×
        </button>

      </div>

      {/* CHAT */}

      <div className="resq-ai-messages">

        {messages.map((item, index) => (
          <div
            key={index}
            className={`resq-ai-message ${item.sender}`}
          >

            {item.sender === "ai" && (
              <div className="message-avatar">
                🤖
              </div>
            )}

            <div className="message-bubble">
              {item.text}
            </div>

          </div>
        ))}

        {loading && (
          <div className="resq-ai-message ai">

            <div className="message-avatar">
              🤖
            </div>

            <div className="message-bubble typing">
              ResQ AI is thinking...
            </div>

          </div>
        )}

        <div ref={chatEndRef} />

      </div>

      {/* QUICK ACTIONS */}

      <div className="resq-ai-quick-actions">

        <button
          onClick={() =>
            sendMessage("How can I stay safe during a flood?")
          }
        >
          Flood Safety
        </button>

        <button
          onClick={() =>
            sendMessage("Give me first aid guidance")
          }
        >
          First Aid
        </button>

        <button
          onClick={() =>
            sendMessage("What is the emergency number?")
          }
        >
          Emergency
        </button>

      </div>

      {/* INPUT */}

      <div className="resq-ai-input-area">

        <input
          type="text"
          placeholder="Tell ResQ AI what is happening..."
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !message.trim()}
        >
          ➤
        </button>

      </div>

      <div className="resq-ai-disclaimer">
        ResQ AI provides safety information and does not
        replace professional emergency services.
      </div>

    </div>
  );
}

export default ResQAI;