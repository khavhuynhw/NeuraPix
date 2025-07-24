package org.kh.neuralpix.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.http.CacheControl;

import java.time.Duration;
import java.util.concurrent.Executor;

/**
 * Performance optimization configuration for NeuralPix application
 * Includes caching, async processing, and static resource optimization
 */
@Configuration
@EnableCaching
@EnableAsync
public class PerformanceConfig implements WebMvcConfigurer {

    /**
     * Configure cache manager for application-level caching
     */
    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(
            "users",
            "user-profiles", 
            "generated-images",
            "api-responses",
            "payment-plans",
            "user-subscriptions"
        );
        return cacheManager;
    }

    /**
     * Configure async executor for non-blocking operations
     * Used for email sending, image processing, etc.
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setKeepAliveSeconds(60);
        executor.setThreadNamePrefix("async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }

    /**
     * Configure static resource caching for better performance
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Cache static resources for 1 year
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365))
                        .cachePublic());

        // Cache images and assets
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(30))
                        .cachePublic());

        // API documentation resources
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/springdoc-openapi-ui/")
                .setCacheControl(CacheControl.maxAge(Duration.ofHours(1)));
    }
}