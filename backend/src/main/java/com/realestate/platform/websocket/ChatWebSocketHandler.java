package com.realestate.platform.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.realestate.platform.model.Chat;
import com.realestate.platform.model.Message;
import com.realestate.platform.model.User;
import com.realestate.platform.repository.ChatRepository;
import com.realestate.platform.repository.MessageRepository;
import com.realestate.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Map<Long, List<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatWebSocketHandler() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule()); // Support Java 8 Time types
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        
        // Parse incoming message
        Map<String, Object> data = objectMapper.readValue(payload, Map.class);
        
        Long chatId = Long.valueOf(data.get("chatId").toString());
        Long senderId = Long.valueOf(data.get("senderId").toString());
        String text = data.containsKey("text") && data.get("text") != null ? data.get("text").toString() : null;
        String imageUrl = data.containsKey("imageUrl") && data.get("imageUrl") != null ? data.get("imageUrl").toString() : null;

        Optional<Chat> chatOpt = chatRepository.findById(chatId);
        Optional<User> senderOpt = userRepository.findById(senderId);

        if (chatOpt.isPresent() && senderOpt.isPresent()) {
            Chat chat = chatOpt.get();
            User sender = senderOpt.get();

            // Create and save message
            Message newMessage = Message.builder()
                    .chat(chat)
                    .sender(sender)
                    .text(text)
                    .imageUrl(imageUrl)
                    .read(false)
                    .createdAt(LocalDateTime.now())
                    .build();

            Message savedMessage = messageRepository.save(newMessage);

            // Update chat timestamp / messages
            chat.getMessages().add(savedMessage);
            chatRepository.save(chat);

            // Determine recipient id
            Long recipientId = chat.getBuyer().getId().equals(senderId) 
                    ? chat.getSeller().getId() 
                    : chat.getBuyer().getId();

            // Prepare payload for sending back
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", savedMessage.getId());
            responseData.put("chatId", chatId);
            responseData.put("sender", Map.of(
                    "id", sender.getId(),
                    "name", sender.getName(),
                    "email", sender.getEmail(),
                    "profilePic", sender.getProfilePic() != null ? sender.getProfilePic() : ""
            ));
            responseData.put("text", savedMessage.getText());
            responseData.put("imageUrl", savedMessage.getImageUrl());
            responseData.put("read", savedMessage.isRead());
            responseData.put("createdAt", savedMessage.getCreatedAt().toString());

            String jsonResponse = objectMapper.writeValueAsString(responseData);
            TextMessage responseTextMessage = new TextMessage(jsonResponse);

            // Broadcast to Sender
            broadcastToUser(senderId, responseTextMessage);

            // Broadcast to Recipient
            broadcastToUser(recipientId, responseTextMessage);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            List<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
        }
    }

    private Long getUserIdFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri != null && uri.getQuery() != null) {
            String[] params = uri.getQuery().split("&");
            for (String param : params) {
                String[] pair = param.split("=");
                if (pair.length == 2 && "userId".equals(pair[0])) {
                    try {
                        return Long.parseLong(pair[1]);
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }
            }
        }
        return null;
    }

    private void broadcastToUser(Long userId, TextMessage message) {
        List<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        // Log send error
                    }
                }
            }
        }
    }
}
