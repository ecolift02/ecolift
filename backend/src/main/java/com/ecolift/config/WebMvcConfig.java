package com.ecolift.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * Serves uploaded files (currently just profile pictures) back over HTTP.
 * Files physically live in app.upload.dir on disk; this maps requests to
 * /uploads/** onto that folder so a saved file is immediately viewable at
 * e.g. http://localhost:8083/uploads/profile-pictures/<filename>.jpg
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/profile-pictures}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // app.upload.dir = uploads/profile-pictures -> we expose the parent
        // "uploads" folder at /uploads/** so it also covers any future
        // upload subfolders without more config.
        String uploadsRoot = new File(uploadDir).getParentFile() == null
                ? uploadDir
                : new File(uploadDir).getParentFile().getAbsolutePath();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadsRoot + File.separator);
    }
}
