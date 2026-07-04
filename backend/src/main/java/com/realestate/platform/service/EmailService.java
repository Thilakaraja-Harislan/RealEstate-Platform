package com.realestate.platform.service;

import com.realestate.platform.model.ContactMessage;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendPasswordResetEmail(String email, String resetUrl) {
        System.out.println("=================================================================");
        System.out.println("EMAIL SENT TO: " + email);
        System.out.println("SUBJECT: Password Reset - Real Estate Platform");
        System.out.println("MESSAGE:");
        System.out.println("You requested a password reset. Please click on the link below:");
        System.out.println(resetUrl);
        System.out.println("=================================================================");
    }

    public void sendContactNotification(ContactMessage message) {
        System.out.println("=================================================================");
        System.out.println("NEW CONTACT REQUEST NOTIFICATION TO ADMIN");
        System.out.println("FROM: " + message.getName() + " (" + message.getEmail() + ")");
        System.out.println("PHONE: " + (message.getPhone() != null ? message.getPhone() : "N/A"));
        System.out.println("ROLE: " + message.getRole());
        System.out.println("MESSAGE:");
        System.out.println(message.getMessage());
        System.out.println("=================================================================");
    }
}
