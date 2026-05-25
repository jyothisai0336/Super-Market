package com.superlavish.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

// ── Login Request ──────────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
class LoginRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String password;
}

// ── Register Request ──────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
class RegisterRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6, max = 72)
    private String password;
    private String phone;
}

// ── Update Profile Request ────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
class UpdateProfileRequest {
    @Size(min = 2, max = 100)
    private String name;
    private String phone;
    private String avatarUrl;
    @Size(min = 6, max = 72)
    private String password;
}

// ── Refresh Token Request ─────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
class RefreshTokenRequest {
    @NotBlank
    private String refreshToken;
}

// ── Auth Response ─────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class AuthResponse {
    private String token;
    private String refreshToken;
    private UserResponse user;
}

// ── User Response ─────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String role;
    private Boolean isVerified;
    private Instant createdAt;
}
