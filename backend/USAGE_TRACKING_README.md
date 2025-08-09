# Usage Tracking Implementation

## Overview

The usage tracking system monitors and limits image generation based on user subscription plans. It tracks daily and monthly generation counts and enforces limits defined in subscription plans.

## Components

### 1. Core Models

- **UsageTracking**: Entity that stores usage records
- **SubscriptionPlan**: Defines daily/monthly generation limits
- **Subscription**: User's active subscription information

### 2. Service Layer

- **UsageTrackingService**: Core service with limit checking and tracking
- **UsageResetSchedulerService**: Automated scheduled tasks for resets
- **GeneratedImageService**: Enhanced with usage validation

### 3. Controllers

- **UsageTrackingController**: REST endpoints for usage management

## Key Features

### 1. Automatic Usage Tracking
```java
// Track image generation automatically
usageTrackingService.trackImageGeneration(userId);
```

### 2. Limit Validation
```java
// Check if user can generate images
boolean canGenerate = usageTrackingService.canGenerateImage(userId);

// Check specific limits
boolean dailyExceeded = usageTrackingService.hasExceededDailyLimit(userId);
boolean monthlyExceeded = usageTrackingService.hasExceededMonthlyLimit(userId);
```

### 3. Usage Information
```java
// Get remaining generations
int dailyRemaining = usageTrackingService.getRemainingDailyGenerations(userId);
int monthlyRemaining = usageTrackingService.getRemainingMonthlyGenerations(userId);
```

## API Endpoints

### Core Endpoints

#### Get Comprehensive Usage Info
```
GET /api/usage-tracking/comprehensive/{userId}
```
Returns detailed usage information including limits, current usage, and subscription details.

#### Check Generation Capability
```
GET /api/usage-tracking/can-generate/{userId}
```
Returns whether the user can generate images and remaining counts.

#### Track Image Generation
```
POST /api/usage-tracking/track-generation/{userId}
```
Manually track an image generation (usually called automatically).

### Detailed Usage Endpoints

#### Daily Usage
```
GET /api/usage-tracking/daily-usage/{userId}
```

#### Monthly Usage
```
GET /api/usage-tracking/monthly-usage/{userId}
```

#### User Limits
```
GET /api/usage-tracking/limits/{userId}
```

### Administrative Endpoints

#### Reset Usage
```
POST /api/usage-tracking/reset-daily/{userId}
POST /api/usage-tracking/reset-monthly/{userId}
```

## Integration Examples

### 1. Image Generation with Usage Tracking

```java
@Service
public class ImageGenerationService {
    
    @Autowired
    private GeneratedImageService generatedImageService;
    
    public GeneratedImage createImage(GeneratedImage image) {
        // This method automatically checks limits and tracks usage
        return generatedImageService.createImageWithUsageTracking(image);
    }
}
```

### 2. Pre-generation Validation

```java
@RestController
public class ImageController {
    
    @Autowired
    private UsageTrackingService usageTrackingService;
    
    @PostMapping("/generate")
    public ResponseEntity<?> generateImage(@RequestParam Long userId) {
        // Check limits before processing
        if (!usageTrackingService.canGenerateImage(userId)) {
            return ResponseEntity.badRequest()
                .body("Generation limit exceeded");
        }
        
        // Proceed with generation...
        return ResponseEntity.ok("Generation started");
    }
}
```

### 3. Frontend Usage Information

```java
@GetMapping("/user/{userId}/dashboard")
public ResponseEntity<UsageTrackingResponseDto> getUserDashboard(@PathVariable Long userId) {
    return ResponseEntity.ok(usageTrackingService.getComprehensiveUsageInfo(userId));
}
```

## Scheduled Tasks

The system includes automatic scheduled tasks:

1. **Daily Reset**: Runs at midnight to prepare for new day tracking
2. **Monthly Reset**: Runs on the 1st of each month
3. **Cleanup**: Removes old usage records (3+ months old) every Sunday
4. **Statistics**: Logs daily usage statistics for monitoring

## Configuration

### Enable Scheduling
The main application class includes `@EnableScheduling` to enable automatic resets.

### Subscription Plan Limits
Configure limits in subscription plans:
- `dailyGenerationLimit`: Daily limit (-1 for unlimited)
- `monthlyGenerationLimit`: Monthly limit (-1 for unlimited)

## Usage Types

The system tracks different types of usage:
- `DAILY_GENERATION`: Daily image generation count
- `MONTHLY_GENERATION`: Monthly image generation count  
- `API_REQUEST`: API request tracking (extensible)

## Error Handling

The system gracefully handles errors:
- Missing subscriptions default to no access
- Database errors default to limiting access (fail-safe)
- Comprehensive logging for troubleshooting

## Best Practices

1. **Always use `createImageWithUsageTracking()`** for image generation
2. **Check limits before expensive operations** like AI model calls
3. **Monitor logs** for usage patterns and errors
4. **Set realistic limits** in subscription plans
5. **Test limit enforcement** in different scenarios

## Example Response

```json
{
  "userId": 123,
  "canGenerate": true,
  "dailyUsage": {
    "date": "2024-01-15",
    "currentUsage": 5,
    "remaining": 15,
    "limit": 20,
    "isUnlimited": false,
    "hasExceeded": false
  },
  "monthlyUsage": {
    "year": 2024,
    "month": 1,
    "currentUsage": 45,
    "remaining": 55,
    "limit": 100,
    "isUnlimited": false,
    "hasExceeded": false
  },
  "limitStatus": {
    "hasActiveLimits": true,
    "hasExceededDailyLimit": false,
    "hasExceededMonthlyLimit": false,
    "subscriptionTier": "PREMIUM",
    "message": "Generation allowed"
  }
}
```

## Future Enhancements

1. **Rate Limiting**: Add per-hour or per-minute limits
2. **Usage Analytics**: Detailed reporting and analytics
3. **Notifications**: Alert users when approaching limits
4. **Grace Periods**: Allow temporary limit overages
5. **Usage Forecasting**: Predict when users will hit limits 