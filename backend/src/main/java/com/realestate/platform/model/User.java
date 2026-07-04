package com.realestate.platform.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    private String phone;

    @Column(name = "profile_pic")
    private String profilePic;

    @Column(nullable = false)
    private String role; // "buyer", "seller", "admin"

    @Column(name = "is_blocked")
    private boolean blocked = false;

    @Column(name = "is_approved")
    private boolean approved = true; // Sellers will require admin approval, default true for buyers

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expire")
    private LocalDateTime resetPasswordExpire;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany
    @JoinTable(
        name = "wishlist",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "property_id")
    )
    @JsonIgnore
    private List<Property> wishlist = new ArrayList<>();
}
