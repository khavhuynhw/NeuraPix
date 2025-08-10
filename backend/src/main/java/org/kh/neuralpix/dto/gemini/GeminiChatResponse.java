package org.kh.neuralpix.dto.gemini;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiChatResponse {
    private String messageId;
    private String conversationId;
    private String content;
    private String messageType; // TEXT, IMAGE, ERROR
    private List<String> generatedImages; // URLs hoặc base64
    private LocalDateTime timestamp;
    private boolean isComplete;
    private String errorMessage;
    private Integer tokensUsed;
    
    public static GeminiChatResponse createTextResponse(String conversationId, String content) {
        return GeminiChatResponse.builder()
                .conversationId(conversationId)
                .content(content)
                .messageType("TEXT")
                .timestamp(LocalDateTime.now())
                .isComplete(true)
                .build();
    }
    
    public static GeminiChatResponse createImageResponse(String conversationId, List<String> images) {
        return GeminiChatResponse.builder()
                .conversationId(conversationId)
                .content("I've generated the images for you!")
                .messageType("IMAGE")
                .generatedImages(images)
                .timestamp(LocalDateTime.now())
                .isComplete(true)
                .build();
    }
    
    public static GeminiChatResponse createErrorResponse(String conversationId, String errorMessage) {
        return GeminiChatResponse.builder()
                .conversationId(conversationId)
                .content("Sorry, I encountered an error processing your request.")
                .messageType("ERROR")
                .errorMessage(errorMessage)
                .timestamp(LocalDateTime.now())
                .isComplete(true)
                .build();
    }
}