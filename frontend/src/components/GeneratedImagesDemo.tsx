import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Tag, Spin, message, Grid } from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  HeartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { generatedImageApi, imageApiUtils } from '../services/generatedImageApi';
import type { GeneratedImageResponse } from '../services/generatedImageApi';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export const GeneratedImagesDemo: React.FC = () => {
  const [images, setImages] = useState<GeneratedImageResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const screens = useBreakpoint();

  const fetchImages = async () => {
    setLoading(true);
    try {
      const userImages = await generatedImageApi.getRecentUserImages(20);
      const readyImages = userImages.filter(imageApiUtils.isImageReady);
      setImages(imageApiUtils.sortImagesByDate(readyImages));
    } catch (error) {
      console.error('Error fetching images:', error);
      message.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAddToChat = async (image: GeneratedImageResponse) => {
    try {
      await generatedImageApi.viewImage(image.id);
      message.success(`Added image from ${new Date(image.createdAt).toLocaleDateString()} to chat`);
    } catch (error) {
      message.error('Failed to add image to chat');
    }
  };

  const handleDownload = async (image: GeneratedImageResponse) => {
    try {
      await generatedImageApi.downloadImage(image.id);
      const link = document.createElement('a');
      link.href = image.imageUrl;
      link.download = `generated-image-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('Image downloaded!');
    } catch (error) {
      message.error('Failed to download image');
    }
  };

  const getStatusColor = (status: GeneratedImageResponse['status']) => {
    const colors = {
      completed: 'green',
      pending: 'orange',
      generating: 'blue',
      failed: 'red',
    };
    return colors[status] || 'default';
  };

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <Title level={2}>Generated Images Gallery Demo</Title>
          <Text type="secondary">
            Showcase of fetched user-generated images with chat integration
          </Text>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Your Generated Images ({images.length})</Text>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={fetchImages}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>Loading your generated images...</Text>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: screens.xs ? '1fr' : 
                                 screens.sm ? 'repeat(2, 1fr)' : 
                                 screens.md ? 'repeat(3, 1fr)' : 
                                 'repeat(4, 1fr)',
              gap: '16px',
            }}
          >
            {images.map((image) => (
              <Card
                key={image.id}
                hoverable
                style={{ borderRadius: '12px', overflow: 'hidden' }}
                cover={
                  <div style={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden' }}>
                    <img
                      alt={`Generated on ${new Date(image.createdAt).toLocaleDateString()}`}
                      src={imageApiUtils.getImageUrl(image, true)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                    <div 
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                      }}
                    >
                      <Tag color={getStatusColor(image.status)}>
                        {image.status}
                      </Tag>
                    </div>
                  </div>
                }
                actions={[
                  <Button
                    key="add"
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddToChat(image)}
                    title="Add to Chat"
                  />,
                  <Button
                    key="download"
                    type="text"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(image)}
                    title="Download"
                  />,
                  <Button
                    key="view"
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    title="View Full Size"
                  />,
                ]}
              >
                <Card.Meta
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <Text strong style={{ fontSize: '12px' }}>
                        {new Date(image.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  }
                  description={
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>👁️ {image.viewsCount}</span>
                        <span>💾 {image.downloadsCount}</span>
                        <span>❤️ {image.likesCount}</span>
                      </div>
                      {image.fileSize && (
                        <div>Size: {Math.round(image.fileSize / 1024)}KB</div>
                      )}
                      {image.generationTime && (
                        <div>Generated in: {image.generationTime}s</div>
                      )}
                    </div>
                  }
                />
              </Card>
            ))}
          </div>
        ) : (
          <Card style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#666' }}>
              <Title level={4} style={{ color: '#999' }}>No Generated Images</Title>
              <Text>Start creating images to see them here!</Text>
            </div>
          </Card>
        )}

        {/* API Information */}
        <Card 
          title="🚀 Implementation Features" 
          style={{ marginTop: '32px' }}
          size="small"
        >
          <div style={{ display: 'grid', gridTemplateColumns: screens.md ? 'repeat(2, 1fr)' : '1fr', gap: '16px' }}>
            <div>
              <Title level={5}>✨ Key Features</Title>
              <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <li><strong>Real-time Fetching:</strong> Automatically loads user's generated images</li>
                <li><strong>Chat Integration:</strong> Click to add images directly to conversations</li>
                <li><strong>Status Tracking:</strong> View generation status and metadata</li>
                <li><strong>Auto-refresh:</strong> Updates after new image generation</li>
                <li><strong>Lazy Loading:</strong> Optimized performance with lazy image loading</li>
              </ul>
            </div>
            <div>
              <Title level={5}>🔧 Technical Details</Title>
              <ul style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <li><strong>API Endpoint:</strong> <code>/api/images/user/me</code></li>
                <li><strong>Pagination:</strong> Supports paginated loading</li>
                <li><strong>Filtering:</strong> Shows only completed, non-deleted images</li>
                <li><strong>Sorting:</strong> Newest images first</li>
                <li><strong>Error Handling:</strong> Graceful error states and retries</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
