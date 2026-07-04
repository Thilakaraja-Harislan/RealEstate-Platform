package com.realestate.platform.controller;

import com.realestate.platform.model.Chat;
import com.realestate.platform.model.User;
import com.realestate.platform.repository.ChatRepository;
import com.realestate.platform.repository.UserRepository;
import com.realestate.platform.service.ChatService;
import com.realestate.platform.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadChatImage(@RequestParam("image") MultipartFile file) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }
        try {
            String url = cloudinaryService.uploadImage(file.getBytes(), "chat_images");
            return ResponseEntity.ok(Map.of("success", true, "url", url));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading image to Cloudinary"));
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startChat(@RequestBody Map<String, Object> requestBody) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        try {
            Long propertyId = Long.valueOf(requestBody.get("propertyId").toString());
            
            Long buyerId;
            Long sellerId;

            if ("seller".equals(currentUser.getRole())) {
                buyerId = Long.valueOf(requestBody.get("buyerId").toString());
                sellerId = currentUser.getId();
            } else {
                buyerId = currentUser.getId();
                sellerId = Long.valueOf(requestBody.get("sellerId").toString());
            }

            User buyer = userRepository.findById(buyerId)
                    .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
            User seller = userRepository.findById(sellerId)
                    .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

            Chat chat = chatService.createOrGetChat(propertyId, buyer, seller);

            // Structure custom response to match Vite expectations
            Map<String, Object> response = new HashMap<>();
            response.put("id", chat.getId());
            response.put("createdAt", chat.getCreatedAt().toString());
            response.put("buyer", Map.of(
                    "id", chat.getBuyer().getId(),
                    "name", chat.getBuyer().getName(),
                    "email", chat.getBuyer().getEmail(),
                    "profilePic", chat.getBuyer().getProfilePic() != null ? chat.getBuyer().getProfilePic() : ""
            ));
            response.put("seller", Map.of(
                    "id", chat.getSeller().getId(),
                    "name", chat.getSeller().getName(),
                    "email", chat.getSeller().getEmail(),
                    "profilePic", chat.getSeller().getProfilePic() != null ? chat.getSeller().getProfilePic() : ""
            ));
            response.put("property", Map.of(
                    "id", chat.getProperty().getId(),
                    "title", chat.getProperty().getTitle(),
                    "price", chat.getProperty().getPrice(),
                    "images", chat.getProperty().getImages()
            ));
            
            List<Map<String, Object>> messagesList = new ArrayList<>();
            chat.getMessages().forEach(msg -> {
                messagesList.add(Map.of(
                        "id", msg.getId(),
                        "sender", Map.of(
                                "id", msg.getSender().getId(),
                                "name", msg.getSender().getName(),
                                "email", msg.getSender().getEmail()
                        ),
                        "text", msg.getText() != null ? msg.getText() : "",
                        "imageUrl", msg.getImageUrl() != null ? msg.getImageUrl() : "",
                        "read", msg.isRead(),
                        "createdAt", msg.getCreatedAt().toString()
                ));
            });
            response.put("messages", messagesList);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error starting chat", "error", e.getMessage()));
        }
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllChatsAdmin() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null || !"admin".equals(currentUser.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Only admins can view all chats"));
        }

        List<Chat> chats = chatRepository.findAll();
        List<Map<String, Object>> responseList = new ArrayList<>();

        chats.forEach(chat -> {
            Map<String, Object> response = new HashMap<>();
            response.put("id", chat.getId());
            response.put("createdAt", chat.getCreatedAt().toString());
            response.put("buyer", Map.of(
                    "id", chat.getBuyer().getId(),
                    "name", chat.getBuyer().getName(),
                    "email", chat.getBuyer().getEmail(),
                    "profilePic", chat.getBuyer().getProfilePic() != null ? chat.getBuyer().getProfilePic() : ""
            ));
            response.put("seller", Map.of(
                    "id", chat.getSeller().getId(),
                    "name", chat.getSeller().getName(),
                    "email", chat.getSeller().getEmail(),
                    "profilePic", chat.getSeller().getProfilePic() != null ? chat.getSeller().getProfilePic() : ""
            ));
            response.put("property", Map.of(
                    "id", chat.getProperty().getId(),
                    "title", chat.getProperty().getTitle(),
                    "price", chat.getProperty().getPrice(),
                    "images", chat.getProperty().getImages()
            ));
            responseList.add(response);
        });

        return ResponseEntity.ok(responseList);
    }

    @GetMapping
    public ResponseEntity<?> getChats() {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Authentication required"));
        }

        List<Chat> chats = chatService.getChatsForUser(currentUser);
        List<Map<String, Object>> responseList = new ArrayList<>();

        chats.forEach(chat -> {
            Map<String, Object> response = new HashMap<>();
            response.put("id", chat.getId());
            response.put("createdAt", chat.getCreatedAt().toString());
            response.put("buyer", Map.of(
                    "id", chat.getBuyer().getId(),
                    "name", chat.getBuyer().getName(),
                    "email", chat.getBuyer().getEmail(),
                    "profilePic", chat.getBuyer().getProfilePic() != null ? chat.getBuyer().getProfilePic() : ""
            ));
            response.put("seller", Map.of(
                    "id", chat.getSeller().getId(),
                    "name", chat.getSeller().getName(),
                    "email", chat.getSeller().getEmail(),
                    "profilePic", chat.getSeller().getProfilePic() != null ? chat.getSeller().getProfilePic() : ""
            ));
            response.put("property", Map.of(
                    "id", chat.getProperty().getId(),
                    "title", chat.getProperty().getTitle(),
                    "price", chat.getProperty().getPrice(),
                    "images", chat.getProperty().getImages()
            ));

            List<Map<String, Object>> messagesList = new ArrayList<>();
            chat.getMessages().forEach(msg -> {
                messagesList.add(Map.of(
                        "id", msg.getId(),
                        "sender", Map.of(
                                "id", msg.getSender().getId(),
                                "name", msg.getSender().getName(),
                                "email", msg.getSender().getEmail()
                        ),
                        "text", msg.getText() != null ? msg.getText() : "",
                        "imageUrl", msg.getImageUrl() != null ? msg.getImageUrl() : "",
                        "read", msg.isRead(),
                        "createdAt", msg.getCreatedAt().toString()
                ));
            });
            response.put("messages", messagesList);

            responseList.add(response);
        });

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getChatDetails(@PathVariable("id") Long id) {
        User currentUser = getAuthenticatedUser();
        Optional<Chat> chatOpt = chatService.getChatById(id);

        if (chatOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Chat not found"));
        }

        Chat chat = chatOpt.get();
        if (currentUser == null || (!chat.getBuyer().getId().equals(currentUser.getId()) && !chat.getSeller().getId().equals(currentUser.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Not authorized"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", chat.getId());
        response.put("createdAt", chat.getCreatedAt().toString());
        response.put("buyer", Map.of(
                "id", chat.getBuyer().getId(),
                "name", chat.getBuyer().getName(),
                "email", chat.getBuyer().getEmail(),
                "profilePic", chat.getBuyer().getProfilePic() != null ? chat.getBuyer().getProfilePic() : ""
        ));
        response.put("seller", Map.of(
                "id", chat.getSeller().getId(),
                "name", chat.getSeller().getName(),
                "email", chat.getSeller().getEmail(),
                "profilePic", chat.getSeller().getProfilePic() != null ? chat.getSeller().getProfilePic() : ""
        ));
        response.put("property", Map.of(
                "id", chat.getProperty().getId(),
                "title", chat.getProperty().getTitle(),
                "price", chat.getProperty().getPrice(),
                "images", chat.getProperty().getImages()
        ));

        List<Map<String, Object>> messagesList = new ArrayList<>();
        chat.getMessages().forEach(msg -> {
            messagesList.add(Map.of(
                    "id", msg.getId(),
                    "sender", Map.of(
                            "id", msg.getSender().getId(),
                            "name", msg.getSender().getName(),
                            "email", msg.getSender().getEmail()
                    ),
                    "text", msg.getText() != null ? msg.getText() : "",
                    "imageUrl", msg.getImageUrl() != null ? msg.getImageUrl() : "",
                    "read", msg.isRead(),
                    "createdAt", msg.getCreatedAt().toString()
            ));
        });
        response.put("messages", messagesList);

        return ResponseEntity.ok(response);
    }
}
