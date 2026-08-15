package com.ecolift.service.impl;

import com.ecolift.exception.InvalidFileException;
import com.ecolift.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5MB

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${application.supabase.url}")
    private String supabaseUrl; // e.g. https://iysfznmgeyppybgehace.supabase.co

    @Value("${application.supabase.service-role-key}")
    private String supabaseServiceRoleKey;

    private static final String BUCKET = "profile-pictures";

    @Override
    public String storeProfilePicture(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("No file was uploaded.");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException(
                    "Unsupported file type. Please upload a JPEG, PNG, or WEBP image.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new InvalidFileException("File is too large. Maximum size is 5MB.");
        }

        try {
            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String extension = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            String filename = "user-" + userId + "-" + UUID.randomUUID() + extension;

            String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET + "/" + filename;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseServiceRoleKey);
            headers.set("Content-Type", file.getContentType());
            headers.set("x-upsert", "true");

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, entity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new InvalidFileException("Failed to upload image. Please try again.");
            }

            // Public URL format for a public Supabase Storage bucket
            return supabaseUrl + "/storage/v1/object/public/" + BUCKET + "/" + filename;

        } catch (IOException ex) {
            throw new InvalidFileException("Failed to read the uploaded file. Please try again.");
        }
    }
}
