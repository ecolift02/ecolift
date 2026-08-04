package com.ecolift.service.impl;

import com.ecolift.exception.InvalidFileException;
import com.ecolift.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5MB

    @Value("${app.upload.dir:uploads/profile-pictures}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8083}")
    private String baseUrl;

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
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String extension = originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : "";
            // Random filename - never trust/reuse the client-supplied name, and
            // this avoids collisions between different users' uploads.
            String filename = "user-" + userId + "-" + UUID.randomUUID() + extension;

            Path targetPath = uploadPath.resolve(filename).normalize();
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return baseUrl + "/uploads/profile-pictures/" + filename;
        } catch (IOException ex) {
            throw new InvalidFileException("Failed to save the uploaded file. Please try again.");
        }
    }
}
