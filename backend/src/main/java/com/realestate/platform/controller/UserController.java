package com.realestate.platform.controller;

import com.realestate.platform.model.User;
import com.realestate.platform.repository.UserRepository;
import com.realestate.platform.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

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

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not logged in"));
        }

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole(),
                "profilePic", user.getProfilePic() != null ? user.getProfilePic() : ""
        ));
    }

    @PutMapping(value = "/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserProfile(
            @RequestParam("name") String name,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "removeProfilePic", required = false) Boolean removeProfilePic,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic) {

        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "User not logged in"));
        }

        try {
            user.setName(name);
            user.setPhone(phone);

            if (removeProfilePic != null && removeProfilePic) {
                user.setProfilePic(null);
            } else if (profilePic != null && !profilePic.isEmpty()) {
                String url = cloudinaryService.uploadImage(profilePic.getBytes(), "profile_pics");
                user.setProfilePic(url);
            }

            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", Map.of(
                            "id", user.getId(),
                            "name", user.getName(),
                            "email", user.getEmail(),
                            "phone", user.getPhone() != null ? user.getPhone() : "",
                            "role", user.getRole(),
                            "profilePic", user.getProfilePic() != null ? user.getProfilePic() : ""
                    )
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading profile picture: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getAdminUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> responseList = new ArrayList<>();

        users.forEach(user -> {
            // Don't show admin themselves in list to prevent self-deletion or self-blocking
            responseList.add(Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "phone", user.getPhone() != null ? user.getPhone() : "",
                    "role", user.getRole(),
                    "blocked", user.isBlocked(),
                    "approved", user.isApproved(),
                    "profilePic", user.getProfilePic() != null ? user.getProfilePic() : ""
            ));
        });

        return ResponseEntity.ok(responseList);
    }

    @PatchMapping("/admin/users/{id}/block")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> toggleUserBlock(@PathVariable("id") Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if ("admin".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cannot block admin user"));
        }

        user.setBlocked(!user.isBlocked());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "User block status updated", "blocked", user.isBlocked()));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if ("admin".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Cannot delete admin user"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "User deleted successfully"));
    }

    @GetMapping("/admin/seller-requests")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getSellerRequests() {
        List<User> users = userRepository.findByRole("seller");
        List<Map<String, Object>> requestsList = new ArrayList<>();

        users.forEach(user -> {
            if (!user.isApproved()) {
                requestsList.add(Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "createdAt", user.getCreatedAt().toString()
                ));
            }
        });

        return ResponseEntity.ok(requestsList);
    }

    @PatchMapping("/admin/seller-requests/{id}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> approveSeller(@PathVariable("id") Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (!"seller".equals(user.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("message", "User is not a seller"));
        }

        user.setApproved(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "Seller approved successfully"));
    }
}
