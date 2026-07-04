package com.realestate.platform.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean isConfigured;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        
        if ("your_cloud_name".equals(cloudName) || "your_api_key".equals(apiKey) || "your_api_secret".equals(apiSecret)) {
            this.cloudinary = null;
            this.isConfigured = false;
        } else {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret));
            this.isConfigured = true;
        }
    }

    public String uploadImage(byte[] imageBytes, String folderName) throws IOException {
        if (!isConfigured) {
            // Return a default sample image in case credentials are not configured yet
            return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";
        }
        Map<?, ?> uploadResult = cloudinary.uploader().upload(imageBytes,
                ObjectUtils.asMap("folder", folderName));
        return (String) uploadResult.get("secure_url");
    }
}
