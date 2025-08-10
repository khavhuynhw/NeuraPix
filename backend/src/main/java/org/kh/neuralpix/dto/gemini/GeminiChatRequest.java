package org.kh.neuralpix.dto.gemini;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiChatRequest {
    private String message;
    private List<String> images; // Base64 encoded images
    private String conversationId;
    private String userId;
    private boolean streamResponse;
    
    // Image generation specific fields
    private String style;
    private String aspectRatio;
    private Integer width;
    private Integer height;
    private String quality;
}