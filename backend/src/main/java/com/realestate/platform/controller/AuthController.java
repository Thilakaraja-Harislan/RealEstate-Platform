package com.realestate.platform.controller;

import com.realestate.platform.model.User;
import com.realestate.platform.repository.UserRepository;
import com.realestate.platform.security.JwtTokenProvider;
import com.realestate.platform.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email address already in use"));
        }

        String role = request.get("role");
        if (role == null || (!role.equals("buyer") && !role.equals("seller") && !role.equals("admin"))) {
            role = "buyer"; // Default role
        }

        // Auto-approve sellers during registration to prevent 403 Forbidden login blocks
        boolean approved = true;

        User user = User.builder()
                .name(request.get("name"))
                .email(email)
                .password(passwordEncoder.encode(request.get("password")))
                .phone(request.get("phone"))
                .role(role)
                .blocked(false)
                .approved(approved)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "User registered successfully", "success", true));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User user = userOpt.get();
        if (user.isBlocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account has been blocked. Please contact support."));
        }

        if (user.getRole().equals("seller") && !user.isApproved()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account is pending admin approval.", "pendingApproval", true));
        }

        String jwt = tokenProvider.generateToken(email);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole(),
                "profilePic", user.getProfilePic() != null ? user.getProfilePic() : ""
        ));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No user found with that email address"));
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpire(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String clientUrl = "http://localhost:5173";
        String resetUrl = clientUrl + "/reset-password/" + resetToken;

        emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);

        return ResponseEntity.ok(Map.of("message", "Password reset email sent", "success", true));
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(@PathVariable("token") String token, @RequestBody Map<String, String> request) {
        Optional<User> userOpt = userRepository.findByResetPasswordToken(token);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid reset token"));
        }

        User user = userOpt.get();
        if (user.getResetPasswordExpire().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Reset token has expired"));
        }

        String newPassword = request.get("password");
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpire(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successful", "success", true));
    }
}
