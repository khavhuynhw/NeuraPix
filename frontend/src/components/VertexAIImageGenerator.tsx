import React, { useState } from 'react';
import { Card, Button, Input, Select, InputNumber, Switch, message, Row, Col, Image } from 'antd';
import { PictureOutlined, EditOutlined, ExpandAltOutlined } from '@ant-design/icons';
import { vertexaiApi, type VertexAIImageRequest, type VertexAIImageResponse } from '../services/vertexaiApi';

const { TextArea } = Input;
const { Option } = Select;

interface VertexAIImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
}

export const VertexAIImageGenerator: React.FC<VertexAIImageGeneratorProps> = ({ onImageGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [request, setRequest] = useState<VertexAIImageRequest>({
    prompt: '',
    negativePrompt: '',
    numberOfImages: 1,
    aspectRatio: '1:1',
    safetyFilterLevel: 'block_some',
    personGeneration: 'allow_adult',
    addWatermark: false,
    language: 'auto'
  });

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Portrait (9:16)', value: '9:16' },
    { label: 'Landscape (16:9)', value: '16:9' },
    { label: 'Vertical (3:4)', value: '3:4' },
    { label: 'Horizontal (4:3)', value: '4:3' }
  ];

  const safetyLevels = [
    { label: 'Block Most', value: 'block_most' },
    { label: 'Block Some', value: 'block_some' },
    { label: 'Block Few', value: 'block_few' }
  ];

  const personGenerationOptions = [
    { label: 'Allow Adult', value: 'allow_adult' },
    { label: 'Block All', value: 'block_all' }
  ];

  const handleGenerate = async () => {
    if (!request.prompt.trim()) {
      message.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    try {
      const response: VertexAIImageResponse = await vertexaiApi.generateImage(request);
      
      if (response.success && response.images) {
        const imageUrls = response.images.map(img => img.imageUrl).filter(Boolean);
        setGeneratedImages(imageUrls);
        
        if (imageUrls.length > 0 && onImageGenerated) {
          onImageGenerated(imageUrls[0]);
        }
        
        message.success(`Generated ${imageUrls.length} image(s) in ${response.processingTimeMs}ms`);
      } else {
        message.error(response.errorMessage || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      message.error('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Vertex AI Imagen Generator" className="mb-4">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Prompt *</label>
            <TextArea
              rows={3}
              placeholder="Describe the image you want to generate..."
              value={request.prompt}
              onChange={(e) => setRequest({ ...request, prompt: e.target.value })}
              maxLength={1000}
            />
          </div>
        </Col>

        <Col span={12}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Negative Prompt</label>
            <TextArea
              rows={2}
              placeholder="What you don't want in the image..."
              value={request.negativePrompt}
              onChange={(e) => setRequest({ ...request, negativePrompt: e.target.value })}
              maxLength={500}
            />
          </div>
        </Col>

        <Col span={12}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
            <Select
              style={{ width: '100%' }}
              value={request.aspectRatio}
              onChange={(value) => setRequest({ ...request, aspectRatio: value })}
            >
              {aspectRatios.map(ratio => (
                <Option key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={8}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Number of Images</label>
            <InputNumber
              min={1}
              max={4}
              style={{ width: '100%' }}
              value={request.numberOfImages}
              onChange={(value) => setRequest({ ...request, numberOfImages: value || 1 })}
            />
          </div>
        </Col>

        <Col span={8}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Safety Filter</label>
            <Select
              style={{ width: '100%' }}
              value={request.safetyFilterLevel}
              onChange={(value) => setRequest({ ...request, safetyFilterLevel: value })}
            >
              {safetyLevels.map(level => (
                <Option key={level.value} value={level.value}>
                  {level.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={8}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Person Generation</label>
            <Select
              style={{ width: '100%' }}
              value={request.personGeneration}
              onChange={(value) => setRequest({ ...request, personGeneration: value })}
            >
              {personGenerationOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col span={12}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Seed (Optional)</label>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Random seed for reproducible results"
              value={request.seed}
              onChange={(value) => setRequest({ ...request, seed: value || undefined })}
            />
          </div>
        </Col>

        <Col span={12}>
          <div className="mb-4 flex items-center">
            <Switch
              checked={request.addWatermark}
              onChange={(checked) => setRequest({ ...request, addWatermark: checked })}
            />
            <span className="ml-2 text-sm">Add Watermark</span>
          </div>
        </Col>

        <Col span={24}>
          <Button
            type="primary"
            size="large"
            icon={<PictureOutlined />}
            loading={loading}
            onClick={handleGenerate}
            disabled={!request.prompt.trim()}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Image with Vertex AI'}
          </Button>
        </Col>

        {generatedImages.length > 0 && (
          <Col span={24}>
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Generated Images</h3>
              <Row gutter={[16, 16]}>
                {generatedImages.map((imageUrl, index) => (
                  <Col key={index} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      cover={
                        <Image
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          style={{ height: 200, objectFit: 'cover' }}
                        />
                      }
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => {
                            // Handle edit action
                            message.info('Edit functionality coming soon');
                          }}
                        >
                          Edit
                        </Button>,
                        <Button
                          type="text"
                          icon={<ExpandAltOutlined />}
                          onClick={() => {
                            // Handle upscale action
                            message.info('Upscale functionality coming soon');
                          }}
                        >
                          Upscale
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        title={`Image ${index + 1}`}
                        description="Generated with Vertex AI Imagen"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Col>
        )}
      </Row>
    </Card>
  );
};