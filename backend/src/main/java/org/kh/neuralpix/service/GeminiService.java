package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.gemini.GeminiChatRequest;
import org.kh.neuralpix.dto.gemini.GeminiChatResponse;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.concurrent.CompletableFuture;

public interface GeminiService {
    
    /**
     * Gửi tin nhắn chat đến Gemini và nhận response
     */
    CompletableFuture<GeminiChatResponse> sendChatMessage(GeminiChatRequest request);
    
    /**
     * Streaming response cho real-time chat
     */
    Flux<String> streamChatMessage(GeminiChatRequest request);
    
    /**
     * Generate image từ text prompt
     */
    CompletableFuture<GeminiChatResponse> generateImage(GeminiChatRequest request);
    
    /**
     * Analyze image và trả về description
     */
    CompletableFuture<GeminiChatResponse> analyzeImage(GeminiChatRequest request);
    
    /**
     * Multi-modal: text + image input
     */
    CompletableFuture<GeminiChatResponse> processMultiModal(GeminiChatRequest request);
}