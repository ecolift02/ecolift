package com.ecolift.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    /**
     * Validates and saves a profile picture to disk, returning the full
     * public URL it can be viewed at (e.g. http://localhost:8083/uploads/
     * profile-pictures/3f9c1e2a.jpg). Throws InvalidFileException if the
     * file is the wrong type or too large.
     */
    String storeProfilePicture(MultipartFile file, Long userId);
}
