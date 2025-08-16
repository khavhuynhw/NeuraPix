package org.kh.neuralpix.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.cloud.aiplatform.v1.PredictionServiceSettings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class VertexAIConfig {
    
    private static final Logger logger = LoggerFactory.getLogger(VertexAIConfig.class);
    
    @Value("${vertexai.project-id}")
    private String projectId;
    
    @Value("${vertexai.location}")
    private String location;
    
    @Value("${vertexai.credentials-path}")
    private String credentialsPath;
    
    @Value("${vertexai.imagen.model}")
    private String imagenModel;
    
    @Bean
    public GoogleCredentials googleCredentials() throws IOException {
        try {
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                new FileInputStream(credentialsPath)
            ).createScoped("https://www.googleapis.com/auth/cloud-platform");
            
            logger.info("Google Cloud credentials loaded successfully from: {}", credentialsPath);
            return credentials;
        } catch (IOException e) {
            logger.error("Failed to load Google Cloud credentials from: {}", credentialsPath, e);
            throw e;
        }
    }
    
    @Bean
    public PredictionServiceClient predictionServiceClient(GoogleCredentials credentials) throws IOException {
        try {
            PredictionServiceSettings settings = PredictionServiceSettings.newBuilder()
                .setCredentialsProvider(() -> credentials)
                .setEndpoint(location + "-aiplatform.googleapis.com:443")
                .build();
            
            PredictionServiceClient client = PredictionServiceClient.create(settings);
            logger.info("Vertex AI Prediction Service Client created successfully for location: {}", location);
            return client;
        } catch (IOException e) {
            logger.error("Failed to create Vertex AI Prediction Service Client", e);
            throw e;
        }
    }
    
    public String getProjectId() {
        return projectId;
    }
    
    public String getLocation() {
        return location;
    }
    
    public String getImagenModel() {
        return imagenModel;
    }
}