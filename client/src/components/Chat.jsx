import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Helper to get user name from localStorage
function getUserName() {
  try {
    const user = JSON.parse(localStorage.getItem("ayurveda_user"));
    return user?.name || "User";
  } catch {
    return "User";
  }
}

// Helper to get user email from localStorage
function getUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem("ayurveda_user"));
    return user?.email || null;
  } catch {
    return null;
  }
}

// Helper to get per-user chat key
function getChatsKey(email) {
  return `ayurveda_all_chats_${email}`;
}

const Chat = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Get current user email
  const userEmail = getUserEmail();

  // Multi-chat state (per user)
  const [allChats, setAllChats] = useState(() => {
    if (!userEmail) return [[]]; // Start with empty chat to show welcome
    const saved = localStorage.getItem(getChatsKey(userEmail));
    const chats = saved ? JSON.parse(saved) : [];
    // If no chats exist, start with an empty chat to show welcome screen
    return chats.length === 0 ? [[]] : chats;
  });
  const [currentChatIdx, setCurrentChatIdx] = useState(0);
  const [input, setInput] = useState("");
  const [isNewChat, setIsNewChat] = useState(false); // Track if we're in a new chat
  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // Save all chats to localStorage (per user)
  useEffect(() => {
    if (userEmail) {
      // Only save chats that have actual content (not empty welcome chats)
      const chatsToSave = allChats.filter((chat) => chat.length > 0);
      localStorage.setItem(getChatsKey(userEmail), JSON.stringify(chatsToSave));
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allChats, currentChatIdx, userEmail]);

  // On mount or when userEmail changes, load only that user's chats
  useEffect(() => {
    if (userEmail) {
      const saved = localStorage.getItem(getChatsKey(userEmail));
      const chats = saved ? JSON.parse(saved) : [];
      // Always start with welcome screen if no chats or on fresh login
      if (chats.length === 0) {
        setAllChats([[]]);
        setCurrentChatIdx(0);
      } else {
        setAllChats(chats);
        setCurrentChatIdx(0);
      }
    } else {
      // Not logged in, show welcome screen
      setAllChats([[]]);
      setCurrentChatIdx(0);
    }
  }, [userEmail]);

  const messages = allChats[currentChatIdx] || [];

  // --- Chat Send Logic ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let updatedChats = [...allChats];
    let chatIdx = currentChatIdx;

    // If starting a new chat, create it and update state
    if (isNewChat || allChats.length === 0) {
      updatedChats = [...allChats, [{ from: "user", text: input }]];
      chatIdx = updatedChats.length - 1;
      setIsNewChat(false);
    } else {
      updatedChats[chatIdx] = [
        ...updatedChats[chatIdx],
        { from: "user", text: input },
      ];
    }
    setAllChats(updatedChats);
    setCurrentChatIdx(chatIdx);

    // --- Smart Greeting Logic ---
    const smartReply = getSmartGreeting(input);
    if (smartReply) {
      updatedChats[chatIdx] = [
        ...updatedChats[chatIdx],
        { from: "bot", text: smartReply },
      ];
      setAllChats([...updatedChats]);
      setInput("");
      return;
    }

    // Add a "bot is typing" message before sending the request
    updatedChats[chatIdx] = [
      ...updatedChats[chatIdx],
      { from: "bot", text: "Nirogya is typing..." },
    ];
    setAllChats([...updatedChats]);

    try {
      const res = await axios.post(
        "https://nirogya-chatbot-backend.onrender.com/api/chat/generate",
        { query: input },
        { withCredentials: true }
      );
      // Replace the "typing" message with the real reply
      updatedChats[chatIdx].pop();
      updatedChats[chatIdx] = [
        ...updatedChats[chatIdx],
        {
          from: "bot",
          text:
            res.data.reply ||
            "Sorry, I don't know about that. Please ask something related to Ayurveda.",
        },
      ];
      setAllChats([...updatedChats]);
    } catch (err) {
      updatedChats[chatIdx] = [
        ...updatedChats[chatIdx],
        {
          from: "bot",
          text:
            err?.response?.data?.reply ||
            "Sorry, I couldn't process your request. Please try again.",
        },
      ];
      setAllChats([...updatedChats]);
    }
    setInput("");
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.post(
        "https://nirogya-chatbot-backend.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );
      // Do NOT remove chat history here!
      localStorage.removeItem("ayurveda_user");
      navigate("/");
    } catch {
      localStorage.removeItem("ayurveda_user");
      navigate("/");
    }
  };

  // New chat handler
  const handleNewChat = () => {
    // Create a new empty chat - this will trigger the empty state welcome screen
    const newChats = [...allChats, []];
    setAllChats(newChats);
    setCurrentChatIdx(newChats.length - 1);
    setIsNewChat(true);
    setInput("");
    setSidebarOpen(false);
  };

  // Switch chat in sidebar
  const handleSwitchChat = (idx) => {
    setCurrentChatIdx(idx);
    setSidebarOpen(false);
  };

  // Clear chat history
  const handleClearHistory = () => {
    // Reset to welcome screen with one empty chat
    setAllChats([[]]);
    setCurrentChatIdx(0);
    setSidebarOpen(false);
  };

  // Replace the handleDeleteChat function:

  const handleDeleteChat = (idx, e) => {
    e.stopPropagation();

    const newChats = allChats.filter((_, chatIdx) => chatIdx !== idx);

    // If no chats left after deletion, create an empty chat for welcome screen
    if (newChats.length === 0) {
      setAllChats([[]]);
      setCurrentChatIdx(0);
    } else {
      setAllChats(newChats);
      // Adjust current index if needed
      if (idx <= currentChatIdx) {
        const newIndex = Math.max(0, currentChatIdx - 1);
        setCurrentChatIdx(newIndex);
      }
    }
  };

  // --- Helper: Chat summary for sidebar ---
  function chatSummary(chat) {
    // Show the first user message as summary if it exists
    const firstUserMsg = chat.find((m) => m.from === "user");
    if (firstUserMsg)
      return (
        firstUserMsg.text.slice(0, 30) +
        (firstUserMsg.text.length > 30 ? "..." : "")
      );
    // Otherwise, show the first bot message as fallback
    return (
      chat[0]?.text.slice(0, 30) + (chat[0]?.text.length > 30 ? "..." : "")
    );
  }
  function chatTimestamp() {
    // No timestamp, so just return empty string or a static label if you want
    return "";
  }

  // Smart greeting logic
  function getSmartGreeting(input) {
    const text = input.trim().toLowerCase();
    if (/^(hi|hello|hey)\b/.test(text)) {
      const replies = [
        "Hey there!",
        "Hi! How can I help you today?",
        "Hello ",
        "Namaste! How can I assist you?",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (/good morning/.test(text)) {
      const replies = [
        "Good morning! Hope you have a great day!",
        "Morning! How can I assist you today?",
        "Wishing you a healthy morning!",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (/good evening/.test(text)) {
      const replies = [
        "Good evening! How’s your day been?",
        "Good evening! How can I help you?",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (/good night/.test(text)) {
      const replies = ["Good night! Rest well.", "Sweet dreams! Take care."];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (/how are you\??/.test(text)) {
      const replies = [
        "I'm just a bot, but I'm here and ready to help!",
        "Doing great! What can I do for you?",
        "I'm always here to assist you with Ayurveda.",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    if (/thank(s| you| u)?[.!]?$/i.test(text)) {
      const replies = [
        "You're welcome!",
        "Happy to help!",
        "Anytime! Let me know if you have more questions.",
        "Glad I could assist you.",
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }
    return null;
  }

  // Function to adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = "auto";

    // Set new height based on content (with max height of 150px)
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;

    // Enable scrolling if content exceeds max height
    textarea.style.overflowY = textarea.scrollHeight > 150 ? "auto" : "hidden";
  };

  // --- Main Render ---
  return (
    <div className="ayur-chat-root dark">
      {/* Sidebar Drawer */}
      <div className={`ayur-sidebar-drawer${sidebarOpen ? " open" : ""}`}>
        <div className="ayur-sidebar-header">
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3d5223] shadow-neumorph hover:animate-pulse ayur-animated-icon"
              style={{ marginRight: "0.2rem" }}
            >
              <span role="img" aria-label="leaf">
                🌿
              </span>
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.2em",
                background: "linear-gradient(135deg, #A8E063 0%, #56AB2F 100%)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Nirogya
            </span>
          </div>
          <button
            className="ayur-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <button className="ayur-btn ayur-sidebar-btn" onClick={handleNewChat}>
          New Chat
        </button>
        <div className="ayur-sidebar-section">
          <div
            style={{
              fontWeight: 600,
              margin: "1rem 0 0.5rem 0",
              background: "linear-gradient(135deg, #A8E063 0%, #56AB2F 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Chat History
          </div>
          <div className="ayur-sidebar-history">
            {allChats
              .map((chat, originalIdx) => ({ chat, originalIdx }))
              .filter(({ chat }) => chat.length > 0 && chat.some((m) => m.from === "user"))
              .map(({ chat, originalIdx }) => (
                <div
                  key={originalIdx}
                  className={`ayur-sidebar-history-item ayur-animated-history${originalIdx === currentChatIdx ? " active" : ""}`}
                  onClick={() => handleSwitchChat(originalIdx)}
                >
                  <div className="ayur-history-content">
                    <div style={{ fontWeight: 500 }}>{chatSummary(chat)}</div>
                    <div style={{ fontSize: "0.85em", color: "#a8e063" }}>
                      {chatTimestamp(chat)}
                    </div>
                  </div>
                  <button
                    className="ayur-delete-chat-btn"
                    onClick={(e) => handleDeleteChat(originalIdx, e)}
                    aria-label="Delete chat"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
          <button
            className="ayur-btn ayur-clear-btn"
            onClick={handleClearHistory}
          >
            Clear All Chats
          </button>
        </div>
      </div>
      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="ayur-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Botanical SVG Accent */}
      <svg className="botanical-bg" viewBox="0 0 400 400" fill="none">
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="120"
          fill="url(#leafGrad)"
          opacity="0.12"
        />
        <defs>
          <linearGradient
            id="leafGrad"
            x1="0"
            y1="0"
            x2="400"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#A8E063" />
            <stop offset="1" stopColor="#56AB2F" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header */}
      <header className="ayur-header glass">
        <button
          className="ayur-hamburger"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          {/* Hamburger icon */}
          <span style={{ fontSize: "2rem", lineHeight: 1 }}>☰</span>
        </button>
        <span className="ayur-title">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#3d5223] shadow-neumorph hover:animate-pulse ayur-animated-icon">
            <span role="img" aria-label="leaf">
              🌿
            </span>
          </span>
          Nirogya
        </span>
        <div className="ayur-header-actions">
          <span className="ayur-username">Welcome, {getUserName()}</span>
          <button className="ayur-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="ayur-chat-main ">
        <div className="ayur-chat-scroll ">
          <div className="ayur-chat-bubbles">
            {messages.length === 0 ? (
              <div className="ayur-empty-state">
                <div className="ayur-welcome-icon">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full  shadow-neumorph hover:animate-pulse ayur-animated-icon">
                    <span role="img" aria-label="leaf">
                      🌿
                    </span>
                  </span>
                </div>
                <h1 className="ayur-welcome-title">Welcome to Nirogya</h1>
                <p className="ayur-welcome-subtitle">
                  Your personal Ayurvedic wellness assistant
                </p>
                <p className="ayur-welcome-description">
                  I'm here to guide you on your journey to holistic health and
                  well-being.
                  <br />
                  Ask me anything about Ayurveda, natural remedies, or wellness
                  practices.
                </p>

                <div className="ayur-suggestion-cards">
                  <div
                    className="ayur-suggestion-card"
                    onClick={() => setInput("What is my dosha type?")}
                  >
                    <span className="suggestion-icon">🧘</span>
                    <span>Discover your dosha</span>
                  </div>
                  <div
                    className="ayur-suggestion-card"
                    onClick={() => setInput("Natural remedies for stress")}
                  >
                    <span className="suggestion-icon">🌱</span>
                    <span>Natural remedies</span>
                  </div>
                  <div
                    className="ayur-suggestion-card"
                    onClick={() => setInput("Ayurvedic morning routine")}
                  >
                    <span className="suggestion-icon">☀️</span>
                    <span>Morning routines</span>
                  </div>
                  <div
                    className="ayur-suggestion-card"
                    onClick={() => setInput("Ayurvedic diet principles")}
                  >
                    <span className="suggestion-icon">🥗</span>
                    <span>Nutrition guidance</span>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`ayur-bubble ayur-${msg.from} animate-pop`}
                  tabIndex={0}
                  aria-label={
                    msg.from === "user" ? "Your message" : "Bot message"
                  }
                >
                  {/* Add message header to show who sent the message */}
                  <div className="ayur-bubble-header">
                    {msg.from === "user" ? `${getUserName()} ` : "Nirogya "}
                  </div>

                  {/* Existing message content */}
                  {msg.from === "bot" && msg.text === "Nirogya is typing..." ? (
                    <span
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      <span>Nirogya is typing</span>
                      <span className="typing-dots" style={{ marginLeft: 4 }}>
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                      </span>
                    </span>
                  ) : msg.from === "bot" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: (props) => (
                          <h2 className="ayur-bot-heading" {...props} />
                        ),
                        h2: (props) => (
                          <h3 className="ayur-bot-subheading" {...props} />
                        ),
                        li: (props) => (
                          <li style={{ marginLeft: "1.2em" }} {...props} />
                        ),
                        p: (props) => (
                          <p className="ayur-bot-text" {...props} />
                        ),
                        strong: (props) => (
                          <strong style={{ color: "#a8e063" }} {...props} />
                        ),
                        em: (props) => (
                          <em style={{ color: "#56ab2f" }} {...props} />
                        ),
                        ul: (props) => (
                          <ul style={{ marginBottom: "0.5em" }} {...props} />
                        ),
                        ol: (props) => (
                          <ol style={{ marginBottom: "0.5em" }} {...props} />
                        ),
                        code: (props) => (
                          <code
                            style={{
                              background: "#2e4d2c",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </main>

      {/* Footer Input */}
      <footer className="ayur-footer glass">
        <form onSubmit={handleSend} className="ayur-input-form">
          <div className="ayur-input-wrap ">
            <textarea
              ref={textareaRef}
              className="ayur-input"
              placeholder="Ask Nirogya…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Adjust height when content changes
                setTimeout(adjustTextareaHeight, 0);
              }}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              style={{
                paddingRight: "3.5rem",
                minHeight: "44px",
                maxHeight: "150px",
                overflowY: "auto", // Enable vertical scrolling when needed
                overflowX: "hidden", // Prevent horizontal scrolling
              }}
            />
            <button
              type="submit"
              className="ayur-btn transition duration-200 font-medium ayur-send-btn"
              disabled={!input.trim()}
              tabIndex={0}
              aria-label="Send"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </footer>

      {/* --- Sidebar Styles --- */}
      <style>{`
.ayur-chat-root {
  min-height: 100vh;
  background: #1e2b1a;
  color: #e0ffe0;
  font-family: 'Mukta', 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
}
.ayur-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.5rem;
  background: rgba(35, 43, 26, 0.85);
  box-shadow: 0 2px 12px #0002;
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #a8e06333;
}
.ayur-header .ayur-title {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #a8e063;
  letter-spacing: 0.5px;
}
.ayur-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.ayur-username {
  font-weight: 600;
  color: #a8e063;
  margin-right: 0.5rem;
  font-size: 1rem;
}
.ayur-btn {
  background: linear-gradient(90deg, #A8E063 0%, #56AB2F 100%);
  color: #234d20;
  border: none;
  border-radius: 1.2rem;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 2px 2px 12px #232b1a44;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  outline: none;
  text-decoration: none;
  display: inline-block;
}
.ayur-btn:hover, .ayur-btn:focus {
  background: linear-gradient(90deg, #56AB2F 0%, #A8E063 100%);
  color: #fff;
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 24px 0 #a8e06344;
}
.ayur-hamburger {
  background: none;
  border: none;
  color: #a8e063;
  margin-right: 1.2rem;
  font-size: 2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}
.ayur-hamburger:hover {
  color: #56ab2f;
}
.ayur-sidebar-drawer {
  position: fixed;
  top: 0; left: -320px;
  width: 320px;
  height: 100vh;
  background: #232b1a;
  color: #e0ffe0;
  z-index: 100;
  box-shadow: 2px 0 16px #0005;
  transition: left 0.25s cubic-bezier(.6,-0.28,.74,.05);
  display: flex;
  flex-direction: column;
  padding: 1.2rem 1rem 1rem 1.2rem;
}
.ayur-sidebar-drawer.open {
  left: 0;
}
.ayur-sidebar-header {
  display: flex;
  align-items: center; 
  justify-content: space-between;
  gap: 0.2rem;         
  margin-bottom: 1.2rem;
}
.ayur-sidebar-close {
  background: none;
  border: none;
  color: #a8e063;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.2s;
}
.ayur-sidebar-close:hover {
  color: #56ab2f;
}
.ayur-sidebar-btn {
  width: 100%;
  margin-bottom: 1.2rem;
}
.ayur-sidebar-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.ayur-sidebar-history {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  max-height: 40vh;
  overflow-y: auto;
  padding: 0.25rem;
}
.ayur-sidebar-history-item {
  background: linear-gradient(90deg, #A8E063 0%, #56AB2F 100%);
  color: #234d20;
  padding: 0.5rem 1.2rem;
  cursor: pointer;
  box-shadow: 2px 2px 12px #232b1a44;
  display: flex;
  justify-content: space-between;
  align-items: center;
  outline: none;
  text-decoration: none;
  border: none;
  margin-bottom: 2px;
  border-radius: 1.2rem;
  font-weight: 600;
  transition: background 0.18s, color 0.18s;
  font-size: 1rem;
}

.ayur-sidebar-history-item:hover, .ayur-sidebar-history-item:focus {
  background: linear-gradient(90deg, #56AB2F 0%, #A8E063 100%);
  color: #fff;
}

.ayur-sidebar-history-item.active {
  background: linear-gradient(90deg, #A8E063 0%, #56AB2F 100%);
}

/* This class adds animation to history items */
.ayur-animated-history {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.ayur-history-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ayur-delete-chat-btn {
  background: none;
  border: none;
  color: #8A0000;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
  opacity: 0.7;
}

.ayur-delete-chat-btn:hover {
  background-color: #537D5D;
  opacity: 1;
}

.ayur-clear-btn {
  background: linear-gradient(90deg, #A8E063 0%, #56AB2F 100%);
  color: #234d20;
  border: none;
  margin-top: auto;
  margin-bottom: 0.5rem;
  transition: background 0.18s, color 0.18s;
}
.ayur-clear-btn:hover {
  background: linear-gradient(90deg, #56AB2F 0%, #A8E063 100%);
  color: #fff;
}
.ayur-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: #0007;
  z-index: 99;
}
.ayur-chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 0.5rem;
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}
.ayur-chat-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 0 1rem 0;
  min-height: 60vh;
}
.ayur-chat-bubbles {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;

  
}
.ayur-bubble {
  max-width: 80%;
  padding: 0.85rem 1.2rem;
  border-radius: 1.2rem;
  font-size: 1.08rem;
  line-height: 1.6;
  box-shadow: 0 2px 12px #0002;
  word-break: break-word;
  white-space: pre-line;
  transition: background 0.2s, color 0.2s;
}
.ayur-user {
  align-self: flex-end;
  background: #333446;
  color: #a8e063;
  border-bottom-right-radius: 0.3rem;
  border: 1.5px solid #a8e06333;
 

}
.ayur-bot {
  align-self: flex-start;
  background: #333446;
  color: #a8e063;
  border-bottom-left-radius: 0.3rem;
  border: 1.5px solid #a8e06333;
 
}
.ayur-bot-heading {
  font-size: 1.1em;
  font-weight: 700;
  color: #a8e063;
  margin-bottom: 0.2em;
}
.ayur-bot-subheading {
  font-size: 1em;
  font-weight: 600;
  color: #56ab2f;
  margin-bottom: 0.15em;
}
.ayur-bot-text {
  margin-bottom: 0.1em;
}
.ayur-footer {
  padding: 1rem 1.5rem 1.2rem 1.5rem;
  background: rgba(35, 43, 26, 0.85);
  border-top: 1px solid #a8e06333;
  box-shadow: 0 -2px 12px #0002;
  position: sticky;
  bottom: 0;
  z-index: 10;
}
.ayur-input-form {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.ayur-input-wrap {
  display: flex;
  align-items: flex-end;
  position: relative;
}
.ayur-input {
  flex: 1;
  border: solid 1px;
  border-radius: 1.5rem;
  padding: 0.8rem 1.2rem;
  font-size: 1.08rem;
  resize: none;
  box-shadow: 0 2px 8px #0002;
  outline: none;
  transition: background 0.18s, color 0.18s, height 0.1s ease;
  min-height: 44px;
  max-height: 150px;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #56AB2F #232b1a;
}

/* Styling for WebKit browsers (Chrome, Safari) */
.ayur-input::-webkit-scrollbar {
  width: 6px;
}

.ayur-input::-webkit-scrollbar-track {
  background: #232b1a;
  border-radius: 10px;
}

.ayur-input::-webkit-scrollbar-thumb {
  background: #56AB2F;
  border-radius: 10px;
}

.ayur-input::-webkit-scrollbar-thumb:hover {
  background: #A8E063;
}
.ayur-send-btn {
  position: absolute;
  right: 0.7rem;
  bottom: 0.7rem;
  background: none;
  border: none;
  color: #a8e063;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 50%;
  transition: background 0.18s, color 0.18s;
}
.ayur-send-btn:disabled {
  color: #a8e06377;
  cursor: not-allowed;
}
.ayur-send-btn:hover:not(:disabled) {
  background: #a8e06322;
  color: #56ab2f;
}
.ayur-hint {
  font-size: 0.92rem;
  color: #a8e063bb;
  margin-top: 0.2rem;
  margin-left: 0.2rem;
}
.botanical-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 420px;
  height: 320px;
  z-index: 0;
  pointer-events: none;
  opacity: 0.13;
}
.typing-dots {
  display: inline-block;
  font-size: 1.5em;
  letter-spacing: 2px;
  animation: blink 1.2s infinite steps(3, start);
}
.typing-dots span {
  opacity: 0.3;
  animation: typing-dot-fade 1.2s infinite;
}
.typing-dots span:nth-child(1) { animation-delay: 0s; }
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-dot-fade {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}
@media (max-width: 900px) {
  .ayur-chat-main {
    max-width: 100vw;
    padding: 0 0.2rem;
  }
  .ayur-header, .ayur-footer {
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
}
@media (max-width: 600px) {
  .ayur-sidebar-drawer {
    width: 95vw;
    left: -95vw;
    padding: 1rem 0.5rem 1rem 0.7rem;
  }
  .ayur-sidebar-drawer.open {
    left: 0;
  }
  .ayur-chat-main {
    padding: 0 0.1rem;
  }
  .ayur-header, .ayur-footer {
    padding-left: 0.3rem;
    padding-right: 0.3rem;
  }
  .ayur-bubble {
    font-size: 0.98rem;
    padding: 0.7rem 0.8rem;
  }
}
.ayur-bubble-header {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  opacity: 0.9;
  font-family: 'Mukta', 'Segoe UI', Arial, sans-serif;
}

/* Ayurveda user and bot bubble headers */

.ayur-user .ayur-bubble-header {
  color: #FEEBF6;
  text-align: right;
  font-weight: bold;
  font-size: 1rem;
}

.ayur-bot .ayur-bubble-header {
  color: #FEEBF6;
  text-align: left;
  font-weight: bold;
  text-bold: bold;
  font-size: 1rem;
}

/* New styles for empty state and suggestions */
.ayur-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  min-height: 60vh;
}

.ayur-welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 20px rgba(168, 224, 99, 0.3));
}

.ayur-welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #A8E063 0%, #56AB2F 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.ayur-welcome-subtitle {
  font-size: 1.2rem;
  color: rgba(224, 255, 224, 0.8);
  margin-bottom: 2rem;
}

.ayur-welcome-description {
  font-size: 1rem;
  color: rgba(224, 255, 224, 0.7);
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.5;
}

.ayur-suggestion-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 600px;
  width: 100%;
}

.ayur-suggestion-card {
  background: rgba(35, 43, 26, 0.6);
  border: 1px solid rgba(168, 224, 99, 0.2);
  border-radius: 0.8rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
  backdrop-filter: blur(10px);
}

.ayur-suggestion-card:hover {
  background: rgba(168, 224, 99, 0.1);
  border-color: rgba(168, 224, 99, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(168, 224, 99, 0.15);
}

.suggestion-icon {
  font-size: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(168, 224, 99, 0.3));
}

@media (max-width: 600px) {
  .ayur-welcome-title {
    font-size: 2rem;
  }
  
  .ayur-suggestion-cards {
    grid-template-columns: 1fr;
  }
}
      `}</style>
    </div>
  );
};

export default Chat;
