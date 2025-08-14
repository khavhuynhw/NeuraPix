import React, { useState } from 'react';
import { Button, Card, Input, message, Typography, Divider } from 'antd';
import { generatedImageApi } from '../services/generatedImageApi';
import type { GeneratedImageResponse } from '../services/generatedImageApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const ImageApiTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImageResponse[]>([]);
  const [testImageUrl, setTestImageUrl] = useState('https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop');

  const testFetchImages = async () => {
    setLoading(true);
    try {
      console.log('Testing fetch user images...');
      const result = await generatedImageApi.getUserImages();
      console.log('Fetch result:', result);
      setImages(result);
      message.success(`Successfully fetched ${result.length} images!`);
    } catch (error) {
      console.error('Fetch test failed:', error);
      message.error('Failed to fetch images: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const testCreateImage = async () => {
    if (!testImageUrl.trim()) {
      message.error('Please enter an image URL');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing create image...');
      const result = await generatedImageApi.createImage({
        imageUrl: testImageUrl,
        status: 'completed',
        isPublic: false,
      });
      console.log('Create result:', result);
      message.success('Successfully created image record!');
      
      // Refresh the list
      testFetchImages();
    } catch (error) {
      console.error('Create test failed:', error);
      message.error('Failed to create image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Generated Images API Test</Title>
      <Text type="secondary">Test the backend API endpoints for generated images</Text>

      <Divider />

      <Card title="🧪 API Tests" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <Button 
            type="primary" 
            onClick={testFetchImages}
            loading={loading}
          >
            Test Fetch Images
          </Button>
          <Button 
            onClick={testCreateImage}
            loading={loading}
          >
            Test Create Image
          </Button>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <Text strong>Test Image URL:</Text>
          <TextArea
            value={testImageUrl}
            onChange={(e) => setTestImageUrl(e.target.value)}
            placeholder="Enter image URL to test create..."
            rows={2}
            style={{ marginTop: '8px' }}
          />
        </div>
      </Card>

      <Card title={`📊 Results (${images.length} images)`}>
        {images.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {images.map((image) => (
              <Card 
                key={image.id}
                size="small"
                cover={
                  <img
                    alt={`Image ${image.id}`}
                    src={image.imageUrl}
                    style={{ height: '200px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDNDOC44Mzc4NSAyMi4wMTY3IDcuNTIxNzMgMTguODM1OCA3LjUyMTczIDE1LjUyMTdDNy41MjE3MyAxMi4yMDc3IDguODM3ODUgOS4wMjY4MyAxMS4xNzE2IDYuNjkzMTdDMTMuNTA1NCA0LjM1OTUxIDE2LjY4NjMgMy4wNDM0IDIwIDMuMDQzNEMyMy4zMTM3IDMuMDQzNCAyNi40OTQ2IDQuMzU5NTEgMjguODI4NCA2LjY5MzE3QzMxLjE2MjEgOS4wMjY4MyAzMi40NzgzIDEyLjIwNzcgMzIuNDc4MyAxNS41MjE3QzMyLjQ3ODMgMTguODM1OCAzMS4xNjIxIDIyLjAxNjcgMjguODI4NCAyNC4zNTAzQzI2LjQ5NDYgMjYuNjgzOSAyMy4zMTM3IDI4IDIwIDI4WiIgZmlsbD0iI0Q5RDlEOSIvPgo8cGF0aCBkPSJNMTcuMzkxMyAxOS4xMzA0SDIyLjYwODdWMjMuNDc4M0gxNy4zOTEzVjE5LjEzMDRaIiBmaWxsPSIjOTQ5NDk0Ii8+CjxwYXRoIGQ9Ik0xNy4zOTEzIDcuODI2MDJIMJEUOA5ODdWMTcuMDQzNUgxNy4zOTEzVjcuODI2MDJaIiBmaWxsPSIjOTQ5NDk0Ii8+Cjwvc3ZnPgo=';
                    }}
                  />
                }
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>ID: {image.id}</Text>
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {image.status}
                    </Text>
                  </div>
                }
              >
                <div style={{ fontSize: '12px' }}>
                  <div><strong>Created:</strong> {new Date(image.createdAt).toLocaleString()}</div>
                  <div><strong>User ID:</strong> {image.userId}</div>
                  <div><strong>Status:</strong> {image.status}</div>
                  <div><strong>Public:</strong> {image.isPublic ? 'Yes' : 'No'}</div>
                  <div><strong>Deleted:</strong> {image.isDeleted ? 'Yes' : 'No'}</div>
                  {image.fileSize && <div><strong>Size:</strong> {Math.round(image.fileSize / 1024)}KB</div>}
                  <div style={{ marginTop: '8px' }}>
                    <Text style={{ fontSize: '10px', color: '#666', wordBreak: 'break-all' }}>
                      {image.imageUrl}
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <Title level={4} style={{ color: '#999' }}>No Images Found</Title>
            <Text>Click "Test Fetch Images" to load your generated images</Text>
          </div>
        )}
      </Card>

      <Card title="🔍 Debug Information" style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}</div>
          <div><strong>Auth Token:</strong> {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</div>
          <div><strong>User:</strong> {localStorage.getItem('user') || 'Not logged in'}</div>
        </div>
      </Card>
    </div>
  );
};
