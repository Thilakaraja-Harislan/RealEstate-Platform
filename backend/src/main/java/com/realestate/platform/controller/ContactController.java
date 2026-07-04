package com.realestate.platform.controller;

import com.realestate.platform.model.ContactMessage;
import com.realestate.platform.repository.ContactMessageRepository;
import com.realestate.platform.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submitContactMessage(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String phone = request.get("phone");
        String role = request.get("role");
        String messageText = request.get("message");

        if (name == null || email == null || role == null || messageText == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        ContactMessage contactMessage = ContactMessage.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .role(role)
                .message(messageText)
                .createdAt(LocalDateTime.now())
                .build();

        ContactMessage savedMessage = contactMessageRepository.save(contactMessage);

        // Notify Admin (print to console)
        emailService.sendContactNotification(savedMessage);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "message", "Contact message submitted successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getContactMessages() {
        List<ContactMessage> messages = contactMessageRepository.findAll();
        return ResponseEntity.ok(messages);
    }
}
