# PixelCut.ai Integration Guide

This document explains how to integrate and use the PixelCut.ai API with your NeuralPix backend application.

## Overview

The integration provides a complete workflow for generating AI images using PixelCut.ai's API, including:
- Prompt management
- Image generation with async processing
- Usage tracking and subscription limits
- Status monitoring
- Error handling

## Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file or system environment:

```bash
# PixelCut.ai Configuration
PIXELCUT_API_KEY=your_pixelcut_api_key_here
```

### 2. Application Properties

The following properties are configured in `application.properties`:

```properties
# PixelCut.ai Configuration
pixelcut.api-key=${PIXELCUT_API_KEY}
pixelcut.base-url=https://api.pixelcut.ai
pixelcut.timeout=30000
```

## API Endpoints

### 1. Generate Image

**POST** `/api/generation/generate`

Generate a new image using PixelCut.ai API.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "negativePrompt": "blurry, low quality",
  "model": "stable-diffusion",
  "width": 512,
  "height": 512,
  "steps": 20,
  "guidanceScale": 7.5,
  "seed": 12345,
  "style": "realistic",
  "numImages": 1,
  "quality": "high",
  "format": "png"
}
```

**Query Parameters:**
- `userId` (Long, required): The ID of the user generating the image

**Response:**
```json
{
  "imageId": 123,
  "promptId": 456,
  "status": "pending",
  "message": "Image generation started successfully"
}
```

### 2. Generate from Existing Prompt

**POST** `/api/generation/generate-from-prompt/{promptId}`

Generate an image using an existing prompt.

**Path Parameters:**
- `promptId` (Long, required): The ID of the existing prompt

**Query Parameters:**
- `userId` (Long, required): The ID of the user generating the image

**Response:**
```json
{
  "imageId": 123,
  "promptId": 456,
  "status": "pending",
  "message": "Image generation from prompt started successfully"
}
```

### 3. Check Generation Status

**GET** `/api/generation/status/{imageId}`

Check the status of an image generation task.

**Path Parameters:**
- `imageId` (Long, required): The ID of the generated image

**Response:**
```json
{
  "imageId": 123,
  "status": "completed",
  "imageUrl": "https://example.com/image.png",
  "thumbnailUrl": "https://example.com/thumbnail.png",
  "errorMessage": null,
  "generationTime": 15.5
}
```

### 4. Get Available Models

**GET** `/api/generation/models`

Get list of available AI models from PixelCut.ai.

**Response:**
```json
["stable-diffusion", "dall-e", "midjourney"]
```

### 5. Get Available Styles

**GET** `/api/generation/styles`

Get list of available styles from PixelCut.ai.

**Response:**
```json
["realistic", "artistic", "cartoon", "anime", "photographic"]
```

## Usage Workflow

### 1. Basic Image Generation

```javascript
// 1. Start image generation
const response = await fetch('/api/generation/generate?userId=123', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: "A majestic dragon flying over a castle",
    model: "stable-diffusion",
    width: 512,
    height: 512
  })
});

const { imageId } = await response.json();

// 2. Poll for status
const checkStatus = async () => {
  const statusResponse = await fetch(`/api/generation/status/${imageId}`);
  const status = await statusResponse.json();
  
  if (status.status === 'completed') {
    console.log('Image ready:', status.imageUrl);
  } else if (status.status === 'failed') {
    console.error('Generation failed:', status.errorMessage);
  } else {
    // Still pending, check again in a few seconds
    setTimeout(checkStatus, 3000);
  }
};

checkStatus();
```

### 2. Using Existing Prompts

```javascript
// 1. Create a prompt first
const promptResponse = await fetch('/api/prompts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 123,
    promptText: "A futuristic cityscape at night",
    model: "dall-e",
    width: 1024,
    height: 1024
  })
});

const prompt = await promptResponse.json();

// 2. Generate image from the prompt
const generationResponse = await fetch(`/api/generation/generate-from-prompt/${prompt.id}?userId=123`, {
  method: 'POST'
});

const { imageId } = await generationResponse.json();
```

## Error Handling

The integration includes comprehensive error handling:

### Common Error Scenarios

1. **API Key Issues**
   - Invalid or missing API key
   - Expired API key
   - Rate limiting

2. **Generation Failures**
   - Invalid prompt content
   - Unsupported model or parameters
   - Server-side generation errors

3. **Usage Limits**
   - Daily generation limit exceeded
   - Monthly generation limit exceeded
   - Subscription expired

### Error Response Format

```json
{
  "error": "Failed to start image generation: Invalid API key"
}
```

## Usage Tracking

The system automatically tracks image generation usage:

- **Daily Limits**: Tracks generations per day based on subscription plan
- **Monthly Limits**: Tracks generations per month based on subscription plan
- **Automatic Tracking**: Usage is tracked when `createImageWithUsageTracking()` is called

### Check Usage Limits

```javascript
const usageResponse = await fetch('/api/usage-tracking/limits/123');
const limits = await usageResponse.json();

console.log('Can generate:', limits.canGenerate);
console.log('Remaining daily:', limits.remainingDailyGenerations);
console.log('Remaining monthly:', limits.remainingMonthlyGenerations);
```

## Subscription Integration

The image generation respects subscription limits:

- **Free Tier**: Limited daily/monthly generations
- **Premium Tiers**: Higher limits, priority processing
- **Enterprise**: Unlimited generations

### Subscription Features

- **Daily Generation Limit**: Set per subscription plan
- **Monthly Generation Limit**: Set per subscription plan
- **Priority Processing**: Higher tiers get faster processing
- **Advanced Models**: Access to premium AI models
- **Higher Resolution**: Support for larger image sizes

## Best Practices

### 1. Prompt Engineering

- Use clear, descriptive prompts
- Include style specifications
- Use negative prompts to avoid unwanted elements
- Experiment with different models and parameters

### 2. Error Handling

- Always check generation status
- Implement retry logic for failed generations
- Handle rate limiting gracefully
- Provide user-friendly error messages

### 3. Performance

- Use async processing for long-running generations
- Implement status polling with appropriate intervals
- Cache frequently used prompts
- Monitor API usage and costs

### 4. User Experience

- Show generation progress to users
- Provide estimated completion times
- Allow users to cancel pending generations
- Save and reuse successful prompts

## Troubleshooting

### Common Issues

1. **Generation Stuck in Pending**
   - Check PixelCut.ai service status
   - Verify API key is valid
   - Check network connectivity

2. **High Failure Rate**
   - Review prompt content for violations
   - Check parameter ranges
   - Monitor API rate limits

3. **Slow Generation**
   - Check subscription tier for priority processing
   - Verify image resolution settings
   - Monitor server load

### Debug Information

Enable debug logging by setting log level to DEBUG in `application.properties`:

```properties
logging.level.org.kh.neuralpix.service.impl.PixelCutServiceImpl=DEBUG
```

## Security Considerations

1. **API Key Protection**
   - Store API keys in environment variables
   - Never commit API keys to version control
   - Rotate API keys regularly

2. **Input Validation**
   - Validate all user inputs
   - Sanitize prompt content
   - Check parameter ranges

3. **Rate Limiting**
   - Implement client-side rate limiting
   - Monitor API usage
   - Set appropriate limits per user

## Support

For issues with the PixelCut.ai integration:

1. Check the application logs for detailed error messages
2. Verify your API key and configuration
3. Test with simple prompts first
4. Contact support with error details and request IDs 