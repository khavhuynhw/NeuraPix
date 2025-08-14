import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  ScissorOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

// Demo component to showcase the new PixelCut-style image display
export const PixelCutImageDemo: React.FC = () => {
  const demoImages = [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  ];

  const handleAction = (action: string, imageUrl: string) => {
    console.log(`${action} action triggered for image:`, imageUrl);
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>
        PixelCut-Style Image Display Demo
      </h1>
      
      {/* Single Image Example */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Single Image Display</h2>
        <div className="message-images pixelcut-style">
          <div className="images-grid single-image">
            <div className="pixelcut-image-card">
              <div className="image-card-container">
                <div className="image-preview-wrapper">
                  <img
                    src={demoImages[0]}
                    alt="Demo image 1"
                    className="image-preview"
                  />
                  
                  <div className="image-overlay">
                    <div className="overlay-gradient"></div>
                    <div className="quick-preview-btn">
                      <Button 
                        type="text" 
                        icon={<ExpandOutlined />}
                        className="preview-btn"
                      />
                    </div>
                  </div>
                </div>

                <div className="image-action-bar">
                  <div className="action-group primary-actions">
                    <Tooltip title="Remove Background" placement="top">
                      <Button 
                        className="pixelcut-action-btn remove-bg"
                        icon={<ScissorOutlined />}
                        onClick={() => handleAction('removeBackground', demoImages[0])}
                      />
                    </Tooltip>
                    <Tooltip title="Generate Background" placement="top">
                      <Button 
                        className="pixelcut-action-btn generate-bg"
                        icon={<BgColorsOutlined />}
                        onClick={() => handleAction('generateBackground', demoImages[0])}
                      />
                    </Tooltip>
                    <Tooltip title="Upscale Image" placement="top">
                      <Button 
                        className="pixelcut-action-btn upscale"
                        icon={<ExpandOutlined />}
                        onClick={() => handleAction('upscale', demoImages[0])}
                      />
                    </Tooltip>
                  </div>
                  
                  <div className="action-group secondary-actions">
                    <Tooltip title="Download" placement="top">
                      <Button 
                        className="pixelcut-action-btn download"
                        icon={<DownloadOutlined />}
                        onClick={() => handleAction('download', demoImages[0])}
                      />
                    </Tooltip>
                  </div>
                </div>

                <div className="image-metadata">
                  <div className="metadata-info">
                    <span className="image-index">#1</span>
                    <span className="image-status">Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple Images Example */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Multiple Images Display</h2>
        <div className="message-images pixelcut-style">
          <div className="images-grid multiple-images">
            {demoImages.map((imageUrl, index) => (
              <div key={index} className="pixelcut-image-card">
                <div className="image-card-container">
                  <div className="image-preview-wrapper">
                    <img
                      src={imageUrl}
                      alt={`Demo image ${index + 1}`}
                      className="image-preview"
                    />
                    
                    <div className="image-overlay">
                      <div className="overlay-gradient"></div>
                      <div className="quick-preview-btn">
                        <Button 
                          type="text" 
                          icon={<ExpandOutlined />}
                          className="preview-btn"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="image-action-bar">
                    <div className="action-group primary-actions">
                      <Tooltip title="Remove Background" placement="top">
                        <Button 
                          className="pixelcut-action-btn remove-bg"
                          icon={<ScissorOutlined />}
                          onClick={() => handleAction('removeBackground', imageUrl)}
                        />
                      </Tooltip>
                      <Tooltip title="Generate Background" placement="top">
                        <Button 
                          className="pixelcut-action-btn generate-bg"
                          icon={<BgColorsOutlined />}
                          onClick={() => handleAction('generateBackground', imageUrl)}
                        />
                      </Tooltip>
                      <Tooltip title="Upscale Image" placement="top">
                        <Button 
                          className="pixelcut-action-btn upscale"
                          icon={<ExpandOutlined />}
                          onClick={() => handleAction('upscale', imageUrl)}
                        />
                      </Tooltip>
                    </div>
                    
                    <div className="action-group secondary-actions">
                      <Tooltip title="Download" placement="top">
                        <Button 
                          className="pixelcut-action-btn download"
                          icon={<DownloadOutlined />}
                          onClick={() => handleAction('download', imageUrl)}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div className="image-metadata">
                    <div className="metadata-info">
                      <span className="image-index">#{index + 1}</span>
                      <span className="image-status">Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="collection-actions">
            <Button 
              type="text" 
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleAction('downloadAll', 'all')}
              className="download-all-btn"
            >
              Download All ({demoImages.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Inline Styles for Demo */}
      <style>{`
        /* PixelCut Style Image Display */
        .message-images.pixelcut-style {
          margin-top: 16px;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .images-grid {
          display: grid;
          gap: 16px;
          width: 100%;
        }

        .images-grid.single-image {
          grid-template-columns: 1fr;
          max-width: 500px;
        }

        .images-grid.multiple-images {
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          max-width: 800px;
        }

        .pixelcut-image-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
        }

        .pixelcut-image-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .image-card-container {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .image-preview-wrapper {
          position: relative;
          background: #f8fafc;
          overflow: hidden;
        }

        .image-preview {
          width: 100%;
          height: auto;
          min-height: 200px;
          object-fit: cover;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .image-preview:hover {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .pixelcut-image-card:hover .image-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        .overlay-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.1) 0%,
            rgba(147, 51, 234, 0.1) 100%
          );
          backdrop-filter: blur(1px);
        }

        .quick-preview-btn {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .preview-btn {
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          color: #374151 !important;
          border: 1px solid rgba(255, 255, 255, 0.8) !important;
          transition: all 0.2s ease !important;
        }

        .preview-btn:hover {
          background: white !important;
          color: #3b82f6 !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .image-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: white;
          border-top: 1px solid #f1f5f9;
        }

        .action-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .pixelcut-action-btn {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          border-radius: 8px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 1px solid !important;
          transition: all 0.2s ease !important;
          font-weight: 500 !important;
        }

        .pixelcut-action-btn.remove-bg {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.1) !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
        }

        .pixelcut-action-btn.remove-bg:hover {
          background: #ef4444 !important;
          color: white !important;
          border-color: #ef4444 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
        }

        .pixelcut-action-btn.generate-bg {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
        }

        .pixelcut-action-btn.generate-bg:hover {
          background: #3b82f6 !important;
          color: white !important;
          border-color: #3b82f6 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
        }

        .pixelcut-action-btn.upscale {
          color: #10b981 !important;
          background: rgba(16, 185, 129, 0.1) !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
        }

        .pixelcut-action-btn.upscale:hover {
          background: #10b981 !important;
          color: white !important;
          border-color: #10b981 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
        }

        .pixelcut-action-btn.download {
          color: #8b5cf6 !important;
          background: rgba(139, 92, 246, 0.1) !important;
          border-color: rgba(139, 92, 246, 0.2) !important;
        }

        .pixelcut-action-btn.download:hover {
          background: #8b5cf6 !important;
          color: white !important;
          border-color: #8b5cf6 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3) !important;
        }

        .image-metadata {
          padding: 8px 16px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
        }

        .metadata-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #64748b;
        }

        .image-index {
          font-weight: 600;
          color: #3b82f6;
        }

        .image-status {
          padding: 2px 8px;
          background: #dcfce7;
          color: #166534;
          border-radius: 12px;
          font-weight: 500;
        }

        .collection-actions {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .download-all-btn {
          color: #6366f1 !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }

        .download-all-btn:hover {
          color: #4f46e5 !important;
          background: rgba(99, 102, 241, 0.1) !important;
        }
      `}</style>
    </div>
  );
};
