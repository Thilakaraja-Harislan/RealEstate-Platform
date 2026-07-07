import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api, { API_URL } from "../../api";
import { chatMessagesStyles as s } from "../../assets/dummyStyles";
import { 
  HiOutlineChatAlt2, 
  HiOutlinePaperAirplane, 
  HiOutlinePhotograph, 
  HiOutlineChevronLeft, 
  HiOutlineTrash,
  HiX
} from "react-icons/hi";

const ChatMessages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch conversations on load
  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Refs to avoid unnecessary WebSocket reconnections when state changes
  const activeChatRef = useRef(activeChat);
  const locationStateRef = useRef(location.state);
  const userRef = useRef(user);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    locationStateRef.current = location.state;
  }, [location.state]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Handle WebSocket Connection
  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket
    const wsUrl = `${API_URL.replace("http", "ws")}/ws?userId=${user.id}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      
      // Check if we came from PropertyDetails with an initial message
      const state = locationStateRef.current;
      if (state && state.activeChatId && state.initialMessage) {
        const chatId = state.activeChatId;
        const msg = state.initialMessage;
        
        // Wait a small delay to ensure WS handler is fully ready
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              chatId: chatId,
              senderId: userRef.current.id,
              text: msg
            }));
          }
        }, 500);

        // Clear location state so we don't send it again
        navigate(location.pathname, { replace: true, state: {} });
      }
    };

    ws.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      
      // 1. If it's for the currently active chat, append it to messages
      const currentActiveChat = activeChatRef.current;
      if (currentActiveChat && currentActiveChat.id === newMsg.chatId) {
        setMessages((prev) => [...prev, newMsg]);
      }

      // 2. Refresh conversations sidebar to update preview text
      fetchConversations();
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      if (ws) ws.close();
    };
  }, [user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get("/api/chat");
      setConversations(res.data);
      
      // Auto-activate a chat if activeChatId is passed in location state
      if (location.state && location.state.activeChatId && !activeChat) {
        const matchingChat = res.data.find(c => c.id === location.state.activeChatId);
        if (matchingChat) {
          handleSelectChat(matchingChat);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const handleSelectChat = async (chat) => {
    try {
      const res = await api.get(`/api/chat/${chat.id}`);
      setActiveChat(res.data);
      setMessages(res.data.messages || []);
      setShowChatMobile(true);
    } catch (err) {
      console.error("Error fetching chat details:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not open");
      return;
    }

    if (!inputText.trim() && !selectedFile) return;

    let imageUrl = null;

    // Handle image upload first
    if (selectedFile) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("image", selectedFile);
        const uploadRes = await api.post("/api/chat/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = uploadRes.data.url;
      } catch (err) {
        console.error("Error uploading image:", err);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
      setSelectedFile(null);
    }

    // Send payload over WebSocket
    const payload = {
      chatId: activeChat.id,
      senderId: user.id,
      text: inputText.trim() ? inputText : null,
      imageUrl: imageUrl
    };

    socketRef.current.send(JSON.stringify(payload));
    setInputText("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getChatPartner = (chat) => {
    if (!user) return {};
    return chat.buyer.id === user.id ? chat.seller : chat.buyer;
  };

  const isSellerLayout = user?.role === "seller";
  
  return (
    <div className={`${s.chatContainer} ${isSellerLayout ? s.chatContainerSeller : s.chatContainerNonSeller}`}>
      <div className={s.chatWrapper}>
        
        {/* Sidebar (Conversations List) */}
        <aside className={`${s.sidebar} ${showChatMobile ? s.sidebarHidden : ""}`}>
          <div className={s.sidebarHeader}>
            <h3 className={s.sidebarTitle}>Conversations</h3>
          </div>
          
          <div className={s.sidebarContent}>
            {conversations.length === 0 ? (
              <div className={s.emptyConversations}>
                <HiOutlineChatAlt2 className={s.emptyIcon} />
                <p>No conversations yet.</p>
              </div>
            ) : (
              conversations.map((chat) => {
                const partner = getChatPartner(chat);
                const lastMsg = chat.messages && chat.messages.length > 0 
                  ? chat.messages[chat.messages.length - 1] 
                  : null;

                const isActive = activeChat && activeChat.id === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`${s.conversationItem} ${isActive ? s.conversationItemActive : ""}`}
                  >
                    <div className={s.avatar}>
                      {partner.profilePic ? (
                        <img src={partner.profilePic} alt={partner.name} className={s.avatarImg} />
                      ) : (
                        <span>{partner.name?.charAt(0)}</span>
                      )}
                    </div>
                    
                    <div className={s.conversationInfo}>
                      <h4 className={s.conversationName}>{partner.name}</h4>
                      <p className={s.conversationPreview}>
                        {lastMsg ? (lastMsg.text || "[Image attachment]") : "Start chatting..."}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Content Area */}
        <main className={`${s.chatArea} ${!showChatMobile ? "hidden lg:flex" : "flex"}`}>
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className={s.chatHeader}>
                <div className={s.chatHeaderLeft}>
                  <button 
                    onClick={() => setShowChatMobile(false)}
                    className={s.backButton}
                  >
                    <HiOutlineChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3 text-left">
                    <img 
                      src={getChatPartner(activeChat).profilePic || `https://ui-avatars.com/api/?name=${getChatPartner(activeChat).name}&background=0d9488&color=fff`} 
                      alt="Partner" 
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className={s.chatPartnerName}>{getChatPartner(activeChat).name}</h4>
                      <p className="text-[11px] text-text-muted">
                        Regarding: <span className="font-bold text-primary">{activeChat.property.title}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className={s.messagesArea}>
                {messages.map((msg) => {
                  const isOwn = msg.sender.id === user.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`${s.messageBubble} ${isOwn ? s.messageOwn : s.messageOther}`}
                    >
                      <div className="flex flex-col">
                        {/* Image Attachment */}
                        {msg.imageUrl && (
                          <div className={s.messageImageWrapper}>
                            <img src={msg.imageUrl} alt="Chat Attachment" className={s.messageImage} />
                          </div>
                        )}
                        {/* Message Text */}
                        {msg.text && <p className={s.messageText}>{msg.text}</p>}
                        
                        <span className="text-[10px] opacity-70 mt-1 self-end">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSend} className={s.messageForm}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-[#f1f5f9] text-text-muted hover:text-primary rounded-full shrink-0 cursor-pointer"
                >
                  <HiOutlinePhotograph size={22} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {selectedFile && (
                  <div className="absolute bottom-[76px] left-[25px] bg-white border rounded-xl p-2 shadow-md flex items-center gap-2">
                    <span className="text-xs text-text-muted max-w-[150px] truncate">{selectedFile.name}</span>
                    <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
                      <HiX size={16} />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={s.messageInput}
                  disabled={uploadingImage}
                />

                <button 
                  type="submit" 
                  className={s.sendButton}
                  disabled={uploadingImage}
                >
                  <HiOutlinePaperAirplane className={s.sendIcon} />
                </button>
              </form>
            </>
          ) : (
            <div className={s.noChatSelected}>
              <HiOutlineChatAlt2 className={s.noChatIcon} />
              <h3 className={s.noChatTitle}>Your Inbox</h3>
              <p className="text-sm">Select a conversation from the list to start messaging.</p>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

export default ChatMessages;
