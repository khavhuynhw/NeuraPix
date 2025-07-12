/**
 * Frontend Integration Example for NeuralPix PixelCut.ai API
 * This example shows how to integrate with the image generation API from a frontend application
 */

class NeuralPixImageGenerator {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.pollingInterval = 3000; // 3 seconds
        this.maxPollingAttempts = 60; // 3 minutes max
    }

    /**
     * Generate an image using a text prompt
     * @param {Object} options - Generation options
     * @param {string} options.prompt - The text prompt
     * @param {string} options.negativePrompt - Negative prompt (optional)
     * @param {string} options.model - AI model to use (optional)
     * @param {number} options.width - Image width (optional)
     * @param {number} options.height - Image height (optional)
     * @param {number} options.steps - Number of steps (optional)
     * @param {number} options.guidanceScale - Guidance scale (optional)
     * @param {string} options.style - Style to apply (optional)
     * @param {number} options.userId - User ID (required)
     * @returns {Promise<Object>} - Generation result with imageId and status
     */
    async generateImage(options) {
        const { userId, ...generationOptions } = options;
        
        if (!userId) {
            throw new Error('userId is required');
        }

        const requestBody = {
            prompt: generationOptions.prompt,
            negativePrompt: generationOptions.negativePrompt || '',
            model: generationOptions.model || 'stable-diffusion',
            width: generationOptions.width || 512,
            height: generationOptions.height || 512,
            steps: generationOptions.steps || 20,
            guidanceScale: generationOptions.guidanceScale || 7.5,
            style: generationOptions.style || 'realistic',
            numImages: 1,
            quality: 'high',
            format: 'png'
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/generation/generate?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start image generation');
            }

            return await response.json();
        } catch (error) {
            console.error('Error starting image generation:', error);
            throw error;
        }
    }

    /**
     * Generate an image from an existing prompt
     * @param {number} promptId - The ID of the existing prompt
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - Generation result
     */
    async generateFromPrompt(promptId, userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/generation/generate-from-prompt/${promptId}?userId=${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to start image generation from prompt');
            }

            return await response.json();
        } catch (error) {
            console.error('Error starting image generation from prompt:', error);
            throw error;
        }
    }

    /**
     * Check the status of an image generation
     * @param {number} imageId - The ID of the generated image
     * @returns {Promise<Object>} - Status information
     */
    async checkStatus(imageId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/generation/status/${imageId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to check generation status');
            }

            return await response.json();
        } catch (error) {
            console.error('Error checking generation status:', error);
            throw error;
        }
    }

    /**
     * Wait for image generation to complete
     * @param {number} imageId - The ID of the generated image
     * @param {Function} onProgress - Progress callback (optional)
     * @returns {Promise<Object>} - Final status with image URL
     */
    async waitForCompletion(imageId, onProgress = null) {
        let attempts = 0;
        
        return new Promise((resolve, reject) => {
            const pollStatus = async () => {
                try {
                    attempts++;
                    const status = await this.checkStatus(imageId);
                    
                    if (onProgress) {
                        onProgress(status, attempts);
                    }

                    if (status.status === 'completed') {
                        resolve(status);
                    } else if (status.status === 'failed') {
                        reject(new Error(status.errorMessage || 'Image generation failed'));
                    } else if (attempts >= this.maxPollingAttempts) {
                        reject(new Error('Image generation timeout'));
                    } else {
                        // Still pending, continue polling
                        setTimeout(pollStatus, this.pollingInterval);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            pollStatus();
        });
    }

    /**
     * Get available AI models
     * @returns {Promise<string[]>} - Array of available models
     */
    async getAvailableModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/generation/models`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch available models');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching available models:', error);
            throw error;
        }
    }

    /**
     * Get available styles
     * @returns {Promise<string[]>} - Array of available styles
     */
    async getAvailableStyles() {
        try {
            const response = await fetch(`${this.baseUrl}/api/generation/styles`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch available styles');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching available styles:', error);
            throw error;
        }
    }

    /**
     * Check user's usage limits
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - Usage information
     */
    async checkUsageLimits(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/api/usage-tracking/limits/${userId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch usage limits');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching usage limits:', error);
            throw error;
        }
    }
}

// Usage Examples

// Example 1: Basic image generation
async function exampleBasicGeneration() {
    const generator = new NeuralPixImageGenerator();
    
    try {
        // Check usage limits first
        const limits = await generator.checkUsageLimits(123);
        console.log('Usage limits:', limits);
        
        if (!limits.canGenerate) {
            console.log('Cannot generate image - limits exceeded');
            return;
        }

        // Start generation
        const result = await generator.generateImage({
            prompt: "A majestic dragon flying over a medieval castle at sunset",
            negativePrompt: "blurry, low quality, distorted",
            model: "stable-diffusion",
            width: 512,
            height: 512,
            style: "realistic",
            userId: 123
        });

        console.log('Generation started:', result);

        // Wait for completion
        const finalStatus = await generator.waitForCompletion(result.imageId, (status, attempt) => {
            console.log(`Polling attempt ${attempt}: ${status.status}`);
        });

        console.log('Image ready:', finalStatus.imageUrl);
        
        // Display the image
        const img = document.createElement('img');
        img.src = finalStatus.imageUrl;
        img.alt = 'Generated Image';
        document.body.appendChild(img);

    } catch (error) {
        console.error('Generation failed:', error);
    }
}

// Example 2: Generate from existing prompt
async function exampleGenerateFromPrompt() {
    const generator = new NeuralPixImageGenerator();
    
    try {
        // First, create a prompt (this would typically be done through your prompt management system)
        const promptResponse = await fetch('http://localhost:8080/api/prompts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: 123,
                promptText: "A futuristic cityscape with flying cars and neon lights",
                model: "dall-e",
                width: 1024,
                height: 1024,
                style: "artistic"
            })
        });

        const prompt = await promptResponse.json();
        console.log('Created prompt:', prompt);

        // Generate image from the prompt
        const result = await generator.generateFromPrompt(prompt.id, 123);
        console.log('Generation from prompt started:', result);

        // Wait for completion
        const finalStatus = await generator.waitForCompletion(result.imageId);
        console.log('Image ready:', finalStatus.imageUrl);

    } catch (error) {
        console.error('Generation from prompt failed:', error);
    }
}

// Example 3: Get available options
async function exampleGetOptions() {
    const generator = new NeuralPixImageGenerator();
    
    try {
        const [models, styles] = await Promise.all([
            generator.getAvailableModels(),
            generator.getAvailableStyles()
        ]);

        console.log('Available models:', models);
        console.log('Available styles:', styles);

        // Populate UI dropdowns
        const modelSelect = document.getElementById('model-select');
        const styleSelect = document.getElementById('style-select');

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelSelect.appendChild(option);
        });

        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style;
            option.textContent = style;
            styleSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Failed to fetch options:', error);
    }
}

// Example 4: React component integration
function ImageGenerationForm() {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);
    
    const generator = new NeuralPixImageGenerator();

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const result = await generator.generateImage({
                prompt: prompt,
                userId: 123, // Get from auth context
                model: 'stable-diffusion',
                width: 512,
                height: 512
            });

            const finalStatus = await generator.waitForCompletion(result.imageId, (status) => {
                // Update progress if needed
                console.log('Generation status:', status.status);
            });

            setGeneratedImage(finalStatus.imageUrl);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                disabled={isGenerating}
            />
            
            <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
            >
                {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>

            {error && <div className="error">{error}</div>}
            
            {generatedImage && (
                <div>
                    <h3>Generated Image:</h3>
                    <img src={generatedImage} alt="Generated" />
                </div>
            )}
        </div>
    );
}

// Export for use in other modules
export default NeuralPixImageGenerator; 