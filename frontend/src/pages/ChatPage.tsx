import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Layout,
  Typography,
  Button,
  Input,
  Avatar,
  Dropdown,
  Upload,
  message,
  Tooltip,
  Alert,
  Modal,
  Select,
  Card,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  LogoutOutlined,
  PictureOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ScissorOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { geminiApi, imageUtils } from "../services/geminiApi";
import type { GeminiChatRequest, GeminiChatResponse } from "../services/geminiApi";
import { pixelcutApi, pixelcutUtils } from "../services/pixelcutApi";
import type { PixelCutResponse } from "../services/pixelcutApi";
import { generatedImageApi, imageApiUtils } from "../services/generatedImageApi";
import type { GeneratedImageResponse } from "../services/generatedImageApi";

const { Sider } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  images?: string[]; // URLs of generated/uploaded images
  messageType?: "TEXT" | "IMAGE" | "ERROR";
}

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
}

export const ChatPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([
    
  ]);

  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [inputValue, setInputValue] = useState("");

  // Removed unused generatedImageUrl state
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // PixelCut states
  const [pixelcutModalVisible, setPixelcutModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [pixelcutOperation, setPixelcutOperation] = useState<'removeBackground' | 'generateBackground' | 'upscale'>('removeBackground');
  const [backgroundPrompt, setBackgroundPrompt] = useState("");
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [isProcessingPixelCut, setIsProcessingPixelCut] = useState(false);

  // Drag and drop states
  const [isDragOver, setIsDragOver] = useState(false);

  // Generated images states
  const [userGeneratedImages, setUserGeneratedImages] = useState<GeneratedImageResponse[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(true);

  // Rename conversation states
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<string | null>(null);
  const [newConversationTitle, setNewConversationTitle] = useState("");

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId,
  );

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  // Fetch user's generated images on component mount
  useEffect(() => {
    fetchUserGeneratedImages();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: New conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewConversation();
      }
      
      // Ctrl/Cmd + D: Delete current conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && currentConversationId) {
        e.preventDefault();
        deleteConversation(currentConversationId);
      }

      // Ctrl/Cmd + R: Rename current conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && currentConversationId) {
        e.preventDefault();
        openRenameModal(currentConversationId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentConversationId, conversations]);

  const fetchUserGeneratedImages = async () => {
    setIsLoadingImages(true);
    try {
      const images = await generatedImageApi.getRecentUserImages(20);
      const readyImages = images.filter(img => img.imageUrl && !img.isDeleted);
      const sortedImages = imageApiUtils.sortImagesByDate(readyImages);
      setUserGeneratedImages(sortedImages);
      
      if (sortedImages.length === 0 && images.length > 0) {
        // No ready images found but images exist - they may still be processing
        message.warning('Some images are still processing or have issues');
      }
    } catch (error) {
      console.error('Error fetching user generated images:', error);
      message.error('Failed to load your generated images: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoadingImages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewConversation = () => {
    try {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: "New Chat",
        timestamp: new Date(),
        messages: [],
      };
      setConversations([newConversation, ...conversations]);
      setCurrentConversationId(newConversation.id);
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  // Function to add generated image to current conversation
  const addImageToChat = async (image: GeneratedImageResponse) => {
    try {
      // Record view count
      await generatedImageApi.viewImage(image.id);
      
      // Create a message with the image
      const imageMessage: Message = {
        id: Date.now().toString(),
        content: `🖼️ Added from gallery: Generated on ${new Date(image.createdAt).toLocaleDateString()}`,
        sender: "user",
        timestamp: new Date(),
        images: [image.imageUrl],
        messageType: "IMAGE",
      };

      updateCurrentConversation(imageMessage);
      message.success('Image added to conversation');
    } catch (error) {
      console.error('Error adding image to chat:', error);
      message.error('Failed to add image to chat');
    }
  };

  // PixelCut functions
  const openPixelCutModal = (imageUrl: string, operation: 'removeBackground' | 'generateBackground' | 'upscale') => {
    setSelectedImageUrl(imageUrl);
    setPixelcutOperation(operation);
    setPixelcutModalVisible(true);
    setBackgroundPrompt("");
    setUpscaleFactor(2);
  };

  const handlePixelCutProcess = async () => {
    if (!selectedImageUrl) {
      message.error('No image selected');
      return;
    }

    setIsProcessingPixelCut(true);
    
    try {
      let response: PixelCutResponse;
      let operationName = '';
      
      switch (pixelcutOperation) {
        case 'removeBackground':
          operationName = 'Background Removal';
          response = await pixelcutApi.removeBackground(selectedImageUrl);
          break;
        case 'generateBackground':
          if (!backgroundPrompt.trim()) {
            message.error('Please enter a background description');
            return;
          }
          operationName = 'Background Generation';
          response = await pixelcutApi.generateBackground(selectedImageUrl, backgroundPrompt);
          break;
        case 'upscale':
          operationName = 'Image Upscaling';
          response = await pixelcutApi.upscaleImage(selectedImageUrl, upscaleFactor);
          break;
        default:
          throw new Error('Invalid operation');
      }

      if (response.success && response.imageUrls && response.imageUrls.length > 0) {
        // Add processed image as a new message
        const processedMessage: Message = {
          id: Date.now().toString(),
          content: `✨ ${operationName} completed successfully!`,
          sender: "assistant",
          timestamp: new Date(),
          images: response.imageUrls,
          messageType: "IMAGE",
        };

        updateCurrentConversation(processedMessage);
        message.success(`${operationName} completed successfully!`);
        setPixelcutModalVisible(false);
        
        // Refresh user's generated images after processing
        fetchUserGeneratedImages();
      } else {
        throw new Error(response.errorMessage || 'Processing failed');
      }
    } catch (error: any) {
      console.error('PixelCut processing error:', error);
      message.error(error.message || 'Failed to process image');
    } finally {
      setIsProcessingPixelCut(false);
    }
  };

  const updateCurrentConversation = (newMessage: Message) => {
    setConversations(conversations.map(conv =>
      conv.id === currentConversationId
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: newMessage.content,
            timestamp: new Date(),
          }
        : conv
    ));
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      message.error('Please drop image files only (JPG, PNG, WebP, GIF)');
      return;
    }

    if (imageFiles.length > 5) {
      message.error('Maximum 5 images allowed at once');
      return;
    }

    imageFiles.forEach(file => {
      handleImageUpload(file);
    });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() && uploadedImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue || "📷 Uploaded image(s)",
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message immediately
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversationId 
        ? { 
            ...conv, 
            messages: [...conv.messages, userMessage],
            lastMessage: inputValue || "Uploaded image(s)",
            timestamp: new Date()
          }
        : conv
    ));

    const messageText = inputValue;
    setInputValue("");
    setIsGenerating(true);

    try {
      // Clear any previous connection errors
      setConnectionError(null);
      setIsConnected(true);

      // Prepare request for Gemini API
      const request: GeminiChatRequest = {
        message: messageText || "Please analyze this image.",
        conversationId: currentConversationId,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      };

      let response: GeminiChatResponse;

      // Choose appropriate API endpoint based on content
      if (uploadedImages.length > 0 && messageText) {
        // Both text and images - use multimodal
        response = await geminiApi.processMultiModal(request);
      } else if (uploadedImages.length > 0) {
        // Only images - analyze them
        response = await geminiApi.analyzeImage(request);
      } else if (messageText.toLowerCase().includes('generate') || 
                 messageText.toLowerCase().includes('create') || 
                 messageText.toLowerCase().includes('draw')) {
        // Text requesting image generation - use hybrid approach
        response = await geminiApi.generateImage(request);
      } else {
        // Regular text chat
        response = await geminiApi.sendMessage(request);
      }

      // Reset retry count on success
      setRetryCount(0);

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        sender: "assistant",
        timestamp: new Date(),
        images: response.generatedImages || undefined,
        messageType: response.messageType as "TEXT" | "IMAGE" | "ERROR",
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, assistantMessage],
              lastMessage: response.content.slice(0, 40) + "...",
              timestamp: new Date()
            }
          : conv
      ));

      // Clear uploaded images after sending
      setUploadedImages([]);

      // Handle different response types
      if (response.messageType === 'IMAGE') {
        message.success('🎨 Image generated successfully!');
        
        // Save generated images to backend database
        if (response.generatedImages && response.generatedImages.length > 0) {
          try {
            await Promise.all(response.generatedImages.map(async (imageUrl) => {
              await generatedImageApi.createImage({
                imageUrl: imageUrl,
                status: 'completed',
                isPublic: false,
              });
            }));
            // Successfully saved generated images to database
          } catch (error) {
            console.error('Failed to save generated images to database:', error);
            // Don't show error to user - this is background operation
          }
        }
        
        // Refresh user's generated images after new image generation
        fetchUserGeneratedImages();
      } else if (response.messageType === 'ENHANCED_PROMPT') {
        message.success('Enhanced prompt generated!');
      } else if (response.messageType === 'TEXT') {
        // Subtle success indicator for regular messages
        setIsConnected(true);
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Handle different types of errors
      let errorText = 'Something went wrong. Please try again.';
      let shouldShowRetry = true;

      if (error.message?.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        errorText = 'Network connection error. Please check your internet connection and try again.';
        setIsConnected(false);
        setConnectionError('Network connection failed');
      } else if (error.response?.status === 401) {
        errorText = 'Authentication failed. Please log in again.';
        shouldShowRetry = false;
      } else if (error.response?.status === 429) {
        errorText = 'Too many requests. Please wait a moment before trying again.';
        setConnectionError('Rate limit exceeded');
      } else if (error.response?.status === 500) {
        errorText = 'Server error. Our team has been notified. Please try again later.';
        setConnectionError('Server error');
      } else if (error.message?.includes('timeout')) {
        errorText = 'Request timed out. Please try again.';
        setConnectionError('Request timeout');
      }

      // Increment retry count
      setRetryCount(prev => prev + 1);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `❌ ${errorText}${shouldShowRetry && retryCount < 3 ? ' (Retry ' + (retryCount + 1) + '/3)' : ''}`,
        sender: "assistant",
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, errorMessage],
              lastMessage: "Error occurred",
              timestamp: new Date()
            }
          : conv
      ));

      // Show user-friendly error messages
      if (error.response?.status === 401) {
        message.error('Please log in again to continue.');
      } else if (error.response?.status === 429) {
        message.warning('Please wait a moment before sending another message.');
      } else {
        message.error(errorText);
      }

    } finally {
      setIsGenerating(false);
    }
  };

  // Removed unused handleDownload function

  const handleImageUpload = async (file: File) => {
    try {
      // Validate image file
      imageUtils.validateImageFile(file);

      // Convert to base64
      const base64 = await imageUtils.fileToBase64(file);
      setUploadedImages(prev => [...prev, base64]);
      message.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error('Error uploading image:', error);
      message.error(error.message || 'Failed to upload image');
    }
    return false; // Prevent default upload behavior
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteConversation = (conversationId: string) => {
    const conversationToDelete = conversations.find(conv => conv.id === conversationId);
    
    Modal.confirm({
      title: 'Delete Conversation',
      content: `Are you sure you want to delete the conversation "${conversationToDelete?.title || 'Unknown'}"? This action cannot be undone.`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        try {
          const updatedConversations = conversations.filter(
            (conv) => conv.id !== conversationId,
          );
          setConversations(updatedConversations);

          if (conversationId === currentConversationId) {
            setCurrentConversationId(
              updatedConversations.length > 0 ? updatedConversations[0].id : "",
            );
          }

          message.success('Conversation deleted successfully');
        } catch (error) {
          console.error('Error deleting conversation:', error);
          message.error('An error occurred while deleting the conversation');
        }
      },
    });
  };

  const openRenameModal = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setConversationToRename(conversationId);
      setNewConversationTitle(conversation.title);
      setRenameModalVisible(true);
    }
  };

  const handleRenameConversation = () => {
    if (!conversationToRename || !newConversationTitle.trim()) {
      message.error('Please enter a conversation name');
      return;
    }

    try {
      const updatedConversations = conversations.map(conv =>
        conv.id === conversationToRename
          ? { ...conv, title: newConversationTitle.trim() }
          : conv
      );
      setConversations(updatedConversations);
      setRenameModalVisible(false);
      setConversationToRename(null);
      setNewConversationTitle("");
      message.success('Conversation renamed successfully');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      message.error('An error occurred while renaming the conversation');
    }
  };

  const clearAllConversations = () => {
    Modal.confirm({
      title: 'Delete All Conversations',
      content: `Are you sure you want to delete all ${conversations.length} conversations? This action cannot be undone.`,
      okText: 'Delete All',
      cancelText: 'Cancel',
      okType: 'danger',
      icon: <ExclamationCircleOutlined />,
      onOk() {
        try {
          setConversations([]);
          setCurrentConversationId("");
          message.success('All conversations deleted successfully');
        } catch (error) {
          console.error('Error clearing all conversations:', error);
          message.error('An error occurred while deleting all conversations');
        }
      },
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/profile?tab=settings"),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="chat-page-container">
      <Layout className="chat-layout">
        {/* Sidebar */}
        <Sider
          width={280}
          className="chat-sidebar"
        >
          <div className="sidebar-content">
            {/* User Profile Header */}
            <div className="user-profile-header">
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomLeft"
              >
                <div className="profile-dropdown">
                  <div className="profile-avatar-wrapper">
                    <Avatar className="profile-avatar" size={24}>
                      N
                    </Avatar>
                  </div>
                  <span className="profile-name">Personal</span>
                  <div className="dropdown-arrow">
                    <svg width="8" height="8" fill="none" viewBox="0 0 8 8">
                      <path
                        fill="currentColor"
                        d="M4 5.49a.374.374 0 0 1-.267-.117l-2.23-2.282a.33.33 0 0 1-.075-.106.367.367 0 0 1-.024-.131c0-.065.015-.124.044-.176a.338.338 0 0 1 .296-.17c.094 0 .176.035.246.105L4.144 4.82h-.285l2.15-2.206a.337.337 0 0 1 .42-.058c.05.029.09.07.12.123a.338.338 0 0 1 .047.176c0 .091-.034.17-.1.237l-2.23 2.282A.356.356 0 0 1 4 5.49Z"
                      />
                    </svg>
                  </div>
                </div>
              </Dropdown>
            </div>





            {/* Conversations Section */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3 className="section-title">Conversations</h3>
                {conversations.length > 0 && (
                  <Button
                    type="text"
                    size="small"
                    onClick={clearAllConversations}
                    className="clear-all-btn"
                    title="Delete all conversations"
                  >
                    🗑️
                  </Button>
                )}
              </div>

              <Tooltip title="Create new conversation (Ctrl+N)" placement="bottom">
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={createNewConversation}
                  className="new-collection-btn"
                >
                  New Conversation
                </Button>
              </Tooltip>

              <div className="conversations-list">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      currentConversationId === conversation.id ? "active" : ""
                    }`}
                    onClick={() => setCurrentConversationId(conversation.id)}
                  >
                    <div className="conversation-content">
                      <Text className="conversation-title">
                        {conversation.title}
                      </Text>
                      {conversation.lastMessage && (
                        <Text className="conversation-preview">
                          {conversation.lastMessage.slice(0, 40)}...
                        </Text>
                      )}
                      <Text className="conversation-time">
                        {conversation.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </div>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: "edit",
                            icon: <EditOutlined />,
                            label: (
                              <span>
                                Rename
                                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                  Ctrl+R
                                </Text>
                              </span>
                            ),
                            onClick: () => openRenameModal(conversation.id),
                          },
                          {
                            key: "delete",
                            icon: <DeleteOutlined />,
                            label: (
                              <span>
                                Delete
                                <Text type="secondary" style={{ fontSize: '11px', marginLeft: '8px' }}>
                                  Ctrl+D
                                </Text>
                              </span>
                            ),
                            danger: true,
                            onClick: () =>
                              deleteConversation(conversation.id),
                          },
                        ],
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="conversation-menu"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Images Section */}
            <div className="sidebar-section">
              <div className="section-header">
                <h3 className="section-title">Generated Images</h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    type="text"
                    size="small"
                    onClick={fetchUserGeneratedImages}
                    className="refresh-gallery-btn"
                    loading={isLoadingImages}
                    title="Refresh images"
                  >
                    🔄
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setShowImageGallery(!showImageGallery)}
                    className="toggle-gallery-btn"
                  >
                    {showImageGallery ? '⌄' : '›'}
                  </Button>
                </div>
              </div>

              {showImageGallery && (
                <div className="generated-images-gallery">
                  {isLoadingImages ? (
                    <div className="loading-images">
                      <LoadingOutlined spin />
                      <span>Loading images...</span>
                    </div>
                  ) : userGeneratedImages.length > 0 ? (
                    <div className="images-grid-sidebar">
                      {userGeneratedImages.slice(0, 12).map((image) => (
                        <div key={image.id} className="sidebar-image-item">
                          <img
                            src={imageApiUtils.getImageUrl(image, true)}
                            alt={`Generated on ${new Date(image.createdAt).toLocaleDateString()}`}
                            className="sidebar-image"
                            onClick={() => addImageToChat(image)}
                            loading="lazy"
                          />
                          <div className="image-overlay-sidebar">
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              className="add-to-chat-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                addImageToChat(image);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-images">
                      <Text className="no-images-text">
                        No images generated yet
                      </Text>
                    </div>
                  )}
                  
                  {userGeneratedImages.length > 12 && (
                    <Button
                      type="text"
                      size="small"
                      className="view-all-btn"
                      onClick={() => {
                        // TODO: Open full gallery modal
                        message.info('Full gallery coming soon!');
                      }}
                    >
                      View All ({userGeneratedImages.length})
                    </Button>
                  )}
                </div>
              )}
            </div>


          </div>
        </Sider>

        {/* Main Chat Area */}
        <Layout className="chat-main">
          {/* Chat Header */}
          <header className="chat-header">
            <h1 className="workspace-title">
              <div className="workspace-container">
                <div className="workspace-button">
                  <div className="workspace-indicator">
                    <svg width="10" height="10" fill="none" viewBox="0 0 10 10">
                      <rect
                        width="8"
                        height="8"
                        x="1"
                        y="1"
                        fill="currentColor"
                        rx="4"
                      />
                    </svg>
                  </div>
                  <span>AI Chat</span>
                </div>
              </div>
            </h1>
            <div className="header-actions">
              <div className="connection-status">
                <Tooltip title={connectionError || (isConnected ? "Connected to AI" : "Disconnected")}>
                  <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ExclamationCircleOutlined />
                    )}
                    <span className="status-text">
                      {isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </Tooltip>
              </div>
            </div>
          </header>



          {/* Main Content Area */}
          <div 
            className={`main-content ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag & Drop Overlay */}
            {isDragOver && (
              <div className="drag-drop-overlay">
                <div className="drag-drop-content">
                  <div className="drag-icon">
                    <PictureOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                  </div>
                  <h3 className="drag-title">Drop images here</h3>
                  <p className="drag-subtitle">Support JPG, PNG, WebP, GIF (max 5 files)</p>
                </div>
              </div>
            )}

            {/* Connection Error Alert */}
            {connectionError && !isConnected && (
              <div className="connection-error-alert">
                <Alert
                  message="Connection Issue"
                  description={connectionError}
                  type="warning"
                  showIcon
                  closable
                  onClose={() => {
                    setConnectionError(null);
                    setIsConnected(true);
                  }}
                  action={
                    <Button size="small" onClick={() => {
                      setConnectionError(null);
                      setIsConnected(true);
                      setRetryCount(0);
                    }}>
                      Retry
                    </Button>
                  }
                />
              </div>
            )}
            
            <div className="messages-container">
              {currentConversation?.messages?.length === 0 ? (
                <div className="welcome-screen">
                  <div className="welcome-content">
                    <div className="welcome-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M8 10.5h8M8 14h4M6 20.4c-1.5 0-2.4-1.6-1.6-2.9l4-6.2c.6-.9 1.6-1.4 2.6-1.4s2 .5 2.6 1.4l4 6.2c.8 1.3-.1 2.9-1.6 2.9H6z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h2 className="welcome-title">Start a conversation</h2>
                    <p className="welcome-description">Send a message to get started with your AI assistant</p>
                  </div>
                </div>
              ) : (
                <div className="chat-messages">
                  {currentConversation?.messages.map((message) => (
                    <div key={message.id} className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}>
                      <div className="message-avatar">
                        {message.sender === 'user' ? (
                          <Avatar size={32} className="user-avatar">
                            <UserOutlined />
                          </Avatar>
                        ) : (
                          <div className="assistant-avatar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-4.276c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5a4.5 4.5 0 0 1-3.09 4.276zM7.5 12.75a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="message-content">
                        <div className="message-bubble">
                          <div className="message-text">{message.content}</div>
                          {/* Display generated images - PixelCut Style */}
                          {message.images && message.images.length > 0 && (
                            <div className="message-images pixelcut-style">
                              <div className={`images-grid ${message.images.length === 1 ? 'single-image' : 'multiple-images'}`}>
                                {message.images.map((imageUrl, index) => (
                                  <div key={index} className="pixelcut-image-card">
                                    <div className="image-card-container">
                                      {/* Image Preview */}
                                      <div className="image-preview-wrapper">
                                        <img
                                          src={imageUrl}
                                          alt={`Generated image ${index + 1}`}
                                          className="image-preview"
                                          onClick={() => window.open(imageUrl, '_blank')}
                                        />
                                        
                                        {/* Image Overlay */}
                                        <div className="image-overlay">
                                          <div className="overlay-gradient"></div>
                                          
                                          {/* Quick Preview Button */}
                                          <div className="quick-preview-btn">
                                            <Button 
                                              type="text" 
                                              icon={<ExpandOutlined />}
                                              onClick={() => window.open(imageUrl, '_blank')}
                                              className="preview-btn"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Action Bar */}
                                      <div className="image-action-bar">
                                        <div className="action-group primary-actions">
                                          <Tooltip title="Remove Background" placement="top">
                                            <Button 
                                              className="pixelcut-action-btn remove-bg"
                                              icon={<ScissorOutlined />}
                                              onClick={() => openPixelCutModal(imageUrl, 'removeBackground')}
                                            />
                                          </Tooltip>
                                          <Tooltip title="Generate Background" placement="top">
                                            <Button 
                                              className="pixelcut-action-btn generate-bg"
                                              icon={<BgColorsOutlined />}
                                              onClick={() => openPixelCutModal(imageUrl, 'generateBackground')}
                                            />
                                          </Tooltip>
                                          <Tooltip title="Upscale Image" placement="top">
                                            <Button 
                                              className="pixelcut-action-btn upscale"
                                              icon={<ExpandOutlined />}
                                              onClick={() => openPixelCutModal(imageUrl, 'upscale')}
                                            />
                                          </Tooltip>
                                        </div>
                                        
                                        <div className="action-group secondary-actions">
                                          <Tooltip title="Download" placement="top">
                                            <Button 
                                              className="pixelcut-action-btn download"
                                              icon={<DownloadOutlined />}
                                              onClick={() => pixelcutUtils.downloadImage(imageUrl, `generated-image-${Date.now()}.png`)}
                                            />
                                          </Tooltip>
                                        </div>
                                      </div>

                                      {/* Image Metadata */}
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
                              
                              {/* Image Collection Actions */}
                              {message.images.length > 1 && (
                                <div className="collection-actions">
                                  <Button 
                                    type="text" 
                                    size="small"
                                    icon={<DownloadOutlined />}
                                    onClick={() => {
                                      message.images?.forEach((url, i) => {
                                        setTimeout(() => {
                                          pixelcutUtils.downloadImage(url, `image-${i + 1}-${Date.now()}.png`);
                                        }, i * 500);
                                      });
                                    }}
                                    className="download-all-btn"
                                  >
                                    Download All ({message.images.length})
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="message-time">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="message-wrapper assistant-message">
                      <div className="message-avatar">
                        <div className="assistant-avatar">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-4.276c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5a4.5 4.5 0 0 1-3.09 4.276zM7.5 12.75a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="message-content">
                        <div className="message-bubble typing">
                          <div className="typing-indicator">
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                            <div className="typing-dot"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Fixed Bottom Input Area */}
            <div className="chat-input-container">
              <div className="input-wrapper">
                {/* Uploaded Images Display */}
                {uploadedImages.length > 0 && (
                  <div className="uploaded-images-preview">
                    <div className="preview-header">
                      <span className="preview-title">📎 Attached Images ({uploadedImages.length})</span>
                      <Button 
                        type="text" 
                        size="small"
                        onClick={() => setUploadedImages([])}
                        className="clear-all-btn"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="images-grid">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="uploaded-image-item">
                          <img src={imageUrl} alt={`Uploaded ${index + 1}`} className="uploaded-image" />
                          <div className="image-overlay">
                            <Button
                              type="text"
                              size="small"
                              className="remove-image-btn"
                              onClick={() => removeUploadedImage(index)}
                              title="Remove image"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                              </svg>
                            </Button>
                            <Button
                              type="text"
                              size="small"
                              className="view-image-btn"
                              onClick={() => window.open(imageUrl, '_blank')}
                              title="View full size"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="input-box">
                  <div className="input-controls-left">
                    <Upload
                      beforeUpload={handleImageUpload}
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      showUploadList={false}
                      multiple
                      className="image-upload"
                    >
                      <Tooltip title="Upload images (JPG, PNG, WebP, GIF)">
                        <Button type="text" className="attach-btn">
                          <PictureOutlined style={{ fontSize: '18px' }} />
                        </Button>
                      </Tooltip>
                    </Upload>

                    {/* PixelCut Quick Actions */}
                    {uploadedImages.length > 0 && (
                      <div className="pixelcut-quick-actions">
                        <Tooltip title="Remove Background">
                          <Button 
                            type="text" 
                            className="quick-action-btn remove-bg"
                            onClick={() => openPixelCutModal(uploadedImages[0], 'removeBackground')}
                          >
                            <ScissorOutlined style={{ fontSize: '16px' }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Generate Background">
                          <Button 
                            type="text" 
                            className="quick-action-btn generate-bg"
                            onClick={() => openPixelCutModal(uploadedImages[0], 'generateBackground')}
                          >
                            <BgColorsOutlined style={{ fontSize: '16px' }} />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Upscale Image">
                          <Button 
                            type="text" 
                            className="quick-action-btn upscale"
                            onClick={() => openPixelCutModal(uploadedImages[0], 'upscale')}
                          >
                            <ExpandOutlined style={{ fontSize: '16px' }} />
                          </Button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-input-area">
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="chat-input"
                      autoSize={{ minRows: 1, maxRows: 6 }}
                      bordered={false}
                    />
                  </div>
                  
                  <div className="input-controls-right">
                    {isGenerating ? (
                      <Button
                        className="send-btn sending"
                        disabled
                        title="AI is thinking..."
                      >
                        <LoadingOutlined spin />
                      </Button>
                    ) : (
                      <Button
                        className={`send-btn ${(inputValue.trim() || uploadedImages.length > 0) ? 'active' : ''}`}
                        onClick={sendMessage}
                        disabled={!inputValue.trim() && uploadedImages.length === 0}
                        title={uploadedImages.length > 0 ? "Send images for analysis" : "Send message"}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M7.33 2L20.67 9.5c.89.5.89 1.5 0 2L7.33 19c-.67.38-1.5-.13-1.33-.83L7.5 12 6 6.83c-.17-.7.66-1.21 1.33-.83Z"
                            fill="currentColor"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Layout>
      </Layout>

      <style>{`
        .chat-page-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .chat-layout {
          height: 100vh;
          background: #ffffff;
        }

        .chat-sidebar {
          border-right: 1px solid #f5f5f5;
          background: #f9fafb;
          color: #5c5c5e;
          height: 100vh;
          position: relative;
          z-index: 100;
        }

        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 12px 8px 24px 8px;
          overflow: hidden;
        }

        .user-profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          height: 32px;
        }

        .profile-dropdown {
          display: flex;
          align-items: center;
          cursor: pointer;
          border-radius: 8px;
          padding: 4px;
          height: 32px;
          transition: background 0.2s ease;
        }

        .profile-dropdown:hover {
          background: rgba(245, 245, 245, 0.1);
        }

        .profile-avatar-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f8f8f8;
          margin-right: 8px;
        }

        .profile-avatar {
          background: #ff4986 !important;
          color: white !important;
          font-weight: 600;
          font-size: 12px;
        }

        .profile-name {
          color: #5c5c5e;
          font-size: 14px;
          font-weight: 500;
          margin-right: 2px;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dropdown-arrow {
          color: #5c5c5e;
          width: 8px;
          height: 8px;
          margin-left: auto;
        }

        .sidebar-toggle-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #5c5c5e;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .sidebar-toggle-btn:hover {
          background: #f3f4f6;
        }

        .navigation-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .search-btn {
          display: flex;
          align-items: center;
          height: 36px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          color: #5c5c5e;
          font-size: 14px;
          width: 100%;
          text-align: left;
          justify-content: flex-start;
          transition: all 0.2s ease;
        }

        .search-btn:hover {
          background: #f3f4f6;
        }

        .search-btn .anticon {
          margin-right: 12px;
          margin-left: -10px;
        }

        .workspace-item {
          display: flex;
          align-items: center;
          height: 36px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          width: 100%;
          transition: all 0.2s ease;
        }

        .workspace-item.active {
          background: #f0f8ff;
          border: 1px solid #e6f3ff;
        }

        .workspace-indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #007aff;
          margin-right: 8px;
        }

        .workspace-item span {
          color: #5c5c5e;
          font-size: 14px;
          font-weight: 500;
        }

        .sidebar-section {
          margin-bottom: 16px;
        }

        .section-title {
          color: #5c5c5e;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 8px;
          padding-left: 4px;
          height: 24px;
          display: flex;
          align-items: center;
        }

        .section-item {
          display: flex;
          align-items: center;
          height: 36px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .section-item:hover {
          background: #f3f4f6;
        }

        .item-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 8px;
        }

        .item-icon.orange {
          color: #fd972f;
        }

        .new-collection-btn {
          display: flex;
          align-items: center;
          height: 36px;
          padding: 10px 4px 10px 12px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          color: #5c5c5e;
          font-size: 14px;
          width: 100%;
          text-align: left;
          justify-content: flex-start;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .new-collection-btn:hover {
          background: #f3f4f6;
        }

        .new-collection-btn .anticon {
          margin-right: 8px;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .conversations-list::-webkit-scrollbar {
          display: none;
        }

        /* Generated Images Gallery Styles */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .toggle-gallery-btn {
          color: #9ca3af !important;
          font-size: 16px !important;
          line-height: 1 !important;
          padding: 0 !important;
          min-width: 20px !important;
          height: 20px !important;
          transition: all 0.2s ease !important;
        }

        .toggle-gallery-btn:hover {
          color: #5c5c5e !important;
          background: rgba(0, 0, 0, 0.05) !important;
        }

        .refresh-gallery-btn {
          color: #9ca3af !important;
          font-size: 14px !important;
          line-height: 1 !important;
          padding: 0 !important;
          min-width: 20px !important;
          height: 20px !important;
          transition: all 0.2s ease !important;
        }

        .refresh-gallery-btn:hover {
          color: #3b82f6 !important;
          background: rgba(59, 130, 246, 0.1) !important;
          transform: rotate(180deg) !important;
        }

        .clear-all-btn {
          color: #9ca3af !important;
          font-size: 14px !important;
          line-height: 1 !important;
          padding: 0 !important;
          min-width: 20px !important;
          height: 20px !important;
          transition: all 0.2s ease !important;
        }

        .clear-all-btn:hover {
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.1) !important;
          transform: scale(1.1) !important;
        }

        .generated-images-gallery {
          margin-top: 8px;
        }

        .loading-images {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          color: #9ca3af;
          font-size: 12px;
        }

        .images-grid-sidebar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
        }

        .sidebar-image-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .sidebar-image-item:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border-color: #3b82f6;
        }

        .sidebar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.2s ease;
        }

        .image-overlay-sidebar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .sidebar-image-item:hover .image-overlay-sidebar {
          opacity: 1;
        }

        .add-to-chat-btn {
          color: white !important;
          background: rgba(59, 130, 246, 0.8) !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          padding: 0 !important;
          transition: all 0.2s ease !important;
        }

        .add-to-chat-btn:hover {
          background: #3b82f6 !important;
          transform: scale(1.1) !important;
        }

        .no-images {
          text-align: center;
          padding: 20px 12px;
          color: #9ca3af;
        }

        .no-images-text {
          font-size: 12px;
          color: #9ca3af;
        }

        .view-all-btn {
          width: 100%;
          text-align: center;
          color: #6366f1 !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
          height: auto !important;
          margin-top: 8px;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }

        .view-all-btn:hover {
          background: rgba(99, 102, 241, 0.1) !important;
          color: #4f46e5 !important;
        }

        .conversation-item {
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 2px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border: 1px solid transparent;
        }

        .conversation-item:hover {
          background: #f3f4f6;
        }

        .conversation-item.active {
          background: #f0f8ff;
          border: 1px solid #e6f3ff;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
        }

        .conversation-title {
          display: block;
          font-weight: 500;
          color: #5c5c5e;
          margin-bottom: 2px;
          font-size: 14px;
          line-height: 20px;
        }

        .conversation-preview {
          display: block;
          color: #9ca3af;
          font-size: 12px;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conversation-time {
          color: #9ca3af;
          font-size: 11px;
        }

        .conversation-menu {
          opacity: 0;
          transition: opacity 0.2s ease;
          width: 20px;
          height: 20px;
          padding: 0;
          color: #6b7280;
          background: transparent;
          border: none;
        }

        .conversation-item:hover .conversation-menu {
          opacity: 1;
        }

        .conversation-collapsed {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          color: #6b7280;
          font-size: 16px;
          width: 100%;
          justify-content: center;
        }

        .message-count {
          position: absolute;
          top: -8px;
          right: -8px;
        }

        .collapsed-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 12px 0;
        }

        .expand-sidebar-btn {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          color: #5c5c5e;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .expand-sidebar-btn:hover {
          background: #f3f4f6;
        }

        .new-chat-btn-collapsed {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: linear-gradient(135deg, #0079ff, #0056b3);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.2s ease;
        }

        .new-chat-btn-collapsed:hover {
          background: linear-gradient(135deg, #3399ff, #0079ff);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 121, 255, 0.3);
        }

        .chat-main {
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background: #ffffff;
          border-bottom: 0.8px solid #ededed;
          height: 56px;
          padding: 8px 16px;
          flex-shrink: 0;
        }

        .workspace-title {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .workspace-container {
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 500;
        }

        .workspace-button {
          display: flex;
          align-items: center;
          cursor: pointer;
          border-radius: 8px;
          padding: 4px 8px;
          margin-left: -8px;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .workspace-button:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .workspace-indicator {
          color: #007aff;
          margin-right: 8px;
          width: 10px;
          height: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .workspace-button span {
          color: #1f2937;
          font-size: 14px;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .status-indicator.connected {
          color: #52c41a;
          background: rgba(82, 196, 26, 0.1);
        }

        .status-indicator.disconnected {
          color: #ff7875;
          background: rgba(255, 120, 117, 0.1);
        }

        .status-text {
          font-size: 11px;
          font-weight: 500;
        }

        .connection-error-alert {
          margin: 12px 16px 0 16px;
          border-radius: 8px;
        }

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

        .download-image-btn {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 12px;
          transition: all 0.2s ease;
        }

        .download-image-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          transform: scale(1.1);
        }

        .floating-sidebar-toggle {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1000;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          color: #5c5c5e;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .floating-sidebar-toggle:hover {
          background: #f3f4f6;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          position: relative;
          overflow: hidden;
        }

        .messages-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .welcome-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .welcome-content {
          text-align: center;
          max-width: 400px;
        }

        .welcome-icon {
          color: #6b7280;
          margin-bottom: 16px;
          display: flex;
          justify-content: center;
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
          margin: 0 0 8px 0;
        }

        .welcome-description {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px 120px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .chat-messages::-webkit-scrollbar {
          display: none;
        }

        .message-wrapper {
          display: flex;
          gap: 12px;
          max-width: 100%;
        }

        .message-wrapper.user-message {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .user-avatar {
          background: #007aff !important;
          color: white !important;
        }

        .assistant-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 70%;
          min-width: 0;
        }

        .user-message .message-content {
          align-items: flex-end;
        }

        .assistant-message .message-content {
          align-items: flex-start;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
          overflow-wrap: break-word;
          transition: all 0.2s ease;
        }

        .user-message .message-bubble {
          background: #007aff;
          color: white;
          border-bottom-right-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 122, 255, 0.2);
        }

        .assistant-message .message-bubble {
          background: #f3f4f6;
          color: #1f2937;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .message-bubble:hover {
          transform: translateY(-1px);
        }

        .user-message .message-bubble:hover {
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }

        .assistant-message .message-bubble:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .message-time {
          font-size: 11px;
          color: #9ca3af;
          margin: 0 4px;
          font-weight: 500;
        }

        .message-bubble.typing {
          background: #f3f4f6;
          padding: 16px 20px;
          border-bottom-left-radius: 4px;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #9ca3af;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .chat-input-container {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(255, 255, 255, 1) 70%, rgba(255, 255, 255, 0.8) 90%, rgba(255, 255, 255, 0));
          backdrop-filter: blur(10px);
          padding: 16px 32px 24px;
          z-index: 100;
        }

        .input-wrapper {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .uploaded-images-preview {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .uploaded-image-item {
          position: relative;
          display: inline-block;
        }

        .uploaded-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 12px;
          border: 2px solid #f3f4f6;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .remove-image-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          line-height: 1;
          min-width: 20px;
          padding: 0;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .remove-image-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .input-box {
          display: flex;
          align-items: flex-end;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          padding: 8px 12px;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .input-box:focus-within {
          border-color: #007aff;
          box-shadow: 0 4px 20px rgba(0, 122, 255, 0.15);
        }

        .input-controls-left,
        .input-controls-right {
          display: flex;
          align-items: center;
          flex-shrink: 0;
          gap: 8px;
        }

        .input-controls-left {
          flex-wrap: wrap;
        }

        .pixelcut-quick-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .quick-action-btn {
          width: 36px !important;
          height: 36px !important;
          min-width: 36px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border: 2px solid !important;
          transition: all 0.2s ease !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .quick-action-btn.remove-bg {
          color: #ff4d4f !important;
          background: rgba(255, 77, 79, 0.1) !important;
          border-color: rgba(255, 77, 79, 0.3) !important;
        }

        .quick-action-btn.remove-bg:hover {
          background: #ff4d4f !important;
          color: white !important;
          border-color: #ff4d4f !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4) !important;
        }

        .quick-action-btn.generate-bg {
          color: #1890ff !important;
          background: rgba(24, 144, 255, 0.1) !important;
          border-color: rgba(24, 144, 255, 0.3) !important;
        }

        .quick-action-btn.generate-bg:hover {
          background: #1890ff !important;
          color: white !important;
          border-color: #1890ff !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4) !important;
        }

        .quick-action-btn.upscale {
          color: #52c41a !important;
          background: rgba(82, 196, 26, 0.1) !important;
          border-color: rgba(82, 196, 26, 0.3) !important;
        }

        .quick-action-btn.upscale:hover {
          background: #52c41a !important;
          color: white !important;
          border-color: #52c41a !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(82, 196, 26, 0.4) !important;
        }

        .attach-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          transition: all 0.2s ease;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .attach-btn:hover {
          background: #e9ecef;
          color: #495057;
          transform: scale(1.08);
          border-color: #dee2e6;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .attach-btn:active {
          transform: scale(1.02);
        }

        .text-input-area {
          flex: 1;
          display: flex;
          align-items: center;
          min-height: 36px;
        }

        .chat-input {
          width: 100%;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          resize: none;
          font-size: 15px;
          line-height: 1.5;
          color: #1f2937;
          padding: 8px 4px !important;
          box-shadow: none !important;
          font-family: inherit;
        }

        .chat-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .send-btn:not(.active):not(.sending) {
          background: #f3f4f6;
          color: #9ca3af;
        }

        .send-btn.active {
          background: #007aff;
          color: white;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }

        .send-btn.active:hover {
          background: #0056d6;
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
        }

        .send-btn.sending {
          background: #007aff;
          color: white;
          cursor: not-allowed;
        }

        .send-btn:disabled:not(.sending) {
          background: #f3f4f6;
          color: #d1d5db;
          cursor: not-allowed;
          transform: scale(1);
          box-shadow: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .chat-header {
            padding: 0 16px;
          }

          .chat-messages {
            padding: 16px 16px 120px 16px;
          }

          .chat-input-container {
            padding: 12px 16px 20px;
          }

          .input-wrapper {
            max-width: 100%;
          }

          .input-box {
            border-radius: 20px;
            padding: 6px 10px;
          }

          .attach-btn,
          .send-btn {
            width: 40px;
            height: 40px;
          }

          .chat-input {
            font-size: 16px;
            padding: 6px 4px !important;
          }

          .message-content {
            max-width: 85%;
          }

          .message-bubble {
            padding: 10px 14px;
            border-radius: 16px;
          }

          .user-message .message-bubble {
            border-bottom-right-radius: 4px;
          }

          .assistant-message .message-bubble {
            border-bottom-left-radius: 4px;
          }

          .uploaded-image {
            width: 50px;
            height: 50px;
          }

          /* PixelCut Style Mobile Responsiveness */
          .message-images.pixelcut-style {
            padding: 12px;
          }

          .images-grid.multiple-images {
            grid-template-columns: 1fr;
          }

          .images-grid.single-image {
            max-width: 100%;
          }

          .pixelcut-image-card {
            border-radius: 8px;
          }

          .image-preview {
            min-height: 160px;
          }

          .image-action-bar {
            padding: 8px 12px;
            flex-wrap: wrap;
            gap: 8px;
          }

          .action-group {
            gap: 6px;
          }

          .pixelcut-action-btn {
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
          }

          .quick-preview-btn {
            top: 8px;
            right: 8px;
          }

          .preview-btn {
            width: 36px !important;
            height: 36px !important;
          }

          .collection-actions {
            margin-top: 8px;
            padding-top: 8px;
          }
        }

        @media (max-width: 480px) {
          .chat-input-container {
            padding: 8px 12px 16px;
          }

          .input-box {
            padding: 4px 8px;
            gap: 6px;
          }

          .attach-btn,
          .send-btn {
            width: 36px;
            height: 36px;
          }
        }

        /* Enhanced Upload Images Styles */
        .uploaded-images-preview {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid #e9ecef;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .preview-title {
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }

        .clear-all-btn {
          color: #6c757d;
          font-size: 12px;
        }

        .clear-all-btn:hover {
          color: #dc3545;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 12px;
        }

        .uploaded-image-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .uploaded-image-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .uploaded-image {
          width: 100%;
          height: 80px;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          gap: 4px;
          padding: 4px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .uploaded-image-item:hover .image-overlay {
          opacity: 1;
        }

        .remove-image-btn,
        .view-image-btn {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .remove-image-btn:hover {
          background: #dc3545 !important;
          color: white !important;
        }

        .view-image-btn:hover {
          background: #007bff !important;
          color: white !important;
        }

        /* Enhanced Image Actions Styles */
        .image-actions {
          position: absolute;
          bottom: 8px;
          right: 8px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
          z-index: 10;
        }

        .generated-image-container:hover .image-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .action-buttons {
          display: flex;
          gap: 6px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .action-btn {
          width: 32px !important;
          height: 32px !important;
          min-width: 32px !important;
          border-radius: 50% !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          transition: all 0.2s ease !important;
          color: white !important;
          background: transparent !important;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .remove-bg-btn:hover {
          background: #ff4d4f !important;
          color: white !important;
        }

        .generate-bg-btn:hover {
          background: #1890ff !important;
          color: white !important;
        }

        .upscale-btn:hover {
          background: #52c41a !important;
          color: white !important;
        }

        .download-btn:hover {
          background: #722ed1 !important;
          color: white !important;
        }

        /* PixelCut Modal Styles */
        .pixelcut-modal .ant-modal-content {
          border-radius: 16px;
          overflow: hidden;
        }

        .pixelcut-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-title-text {
          font-size: 18px;
          font-weight: 600;
          color: #262626;
        }

        .modal-section {
          margin-bottom: 24px;
        }

        .section-header {
          margin-bottom: 12px;
        }

        .section-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #262626;
        }

        .image-preview-container {
          border-radius: 12px;
          overflow: hidden;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
        }

        .modal-preview-image {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 8px;
        }

        .background-prompt-input {
          border-radius: 8px;
          border: 1px solid #d9d9d9;
        }

        .prompt-suggestions {
          margin-top: 12px;
        }

        .suggestions-label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-tag {
          background: #f0f0f0;
          border-radius: 16px;
          font-size: 12px;
          height: 28px;
          padding: 0 12px;
          border: 1px solid #d9d9d9;
          transition: all 0.2s ease;
        }

        .suggestion-tag:hover {
          background: #1890ff;
          color: white;
          border-color: #1890ff;
        }

        .upscale-options {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .upscale-select {
          min-width: 220px;
        }

        .operation-info-card {
          border-radius: 12px;
          border: 1px solid #e9ecef;
          background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
        }

        .info-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .info-icon {
          font-size: 24px;
          min-width: 32px;
          text-align: center;
        }

        .info-text {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        /* Drag & Drop Styles */
        .main-content.drag-over {
          position: relative;
        }

        .drag-drop-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(24, 144, 255, 0.1);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #1890ff;
          border-radius: 12px;
          margin: 16px;
        }

        .drag-drop-content {
          text-align: center;
          color: #1890ff;
        }

        .drag-icon {
          margin-bottom: 16px;
          animation: bounce 1s infinite;
        }

        .drag-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #1890ff;
        }

        .drag-subtitle {
          font-size: 14px;
          margin: 0;
          color: #666;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .images-grid {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
            gap: 8px;
          }

          .uploaded-image {
            height: 60px;
          }

          .action-buttons {
            gap: 4px;
            padding: 4px;
          }

          .action-btn {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
          }

          .pixelcut-modal {
            margin: 16px;
          }

          .drag-title {
            font-size: 20px;
          }

          .drag-subtitle {
            font-size: 12px;
          }

          .drag-icon svg {
            font-size: 36px !important;
          }
        }
      `}</style>

      {/* PixelCut Processing Modal */}
      <Modal
        title={
          <div className="pixelcut-modal-header">
            <div className="modal-icon">
              {pixelcutOperation === 'removeBackground' && <ScissorOutlined style={{ color: '#ff4d4f' }} />}
              {pixelcutOperation === 'generateBackground' && <BgColorsOutlined style={{ color: '#1890ff' }} />}
              {pixelcutOperation === 'upscale' && <ExpandOutlined style={{ color: '#52c41a' }} />}
            </div>
            <div className="modal-title-text">
              {pixelcutOperation === 'removeBackground' && 'Remove Background'}
              {pixelcutOperation === 'generateBackground' && 'Generate Background'}
              {pixelcutOperation === 'upscale' && 'Upscale Image'}
            </div>
          </div>
        }
        open={pixelcutModalVisible}
        onCancel={() => setPixelcutModalVisible(false)}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setPixelcutModalVisible(false)}
            size="large"
          >
            Cancel
          </Button>,
          <Button
            key="process"
            type="primary"
            size="large"
            loading={isProcessingPixelCut}
            onClick={handlePixelCutProcess}
            disabled={pixelcutOperation === 'generateBackground' && !backgroundPrompt.trim()}
            icon={
              !isProcessingPixelCut && (
                pixelcutOperation === 'removeBackground' ? <ScissorOutlined /> :
                pixelcutOperation === 'generateBackground' ? <BgColorsOutlined /> :
                <ExpandOutlined />
              )
            }
          >
            {isProcessingPixelCut ? 'Processing...' : 
             pixelcutOperation === 'removeBackground' ? 'Remove Background' :
             pixelcutOperation === 'generateBackground' ? 'Generate Background' :
             'Upscale Image'}
          </Button>,
        ]}
        width={700}
        className="pixelcut-modal"
      >
        {/* Image Preview Section */}
        <div className="modal-section">
          <div className="section-header">
            <h4 className="section-title">🖼️ Image Preview</h4>
          </div>
          <div className="image-preview-container">
            {selectedImageUrl && (
              <img
                src={selectedImageUrl}
                alt="Selected image"
                className="modal-preview-image"
              />
            )}
          </div>
        </div>

        {/* Operation Specific Controls */}
        {pixelcutOperation === 'generateBackground' && (
          <div className="modal-section">
            <div className="section-header">
              <h4 className="section-title">🎨 Background Description</h4>
            </div>
            <TextArea
              placeholder="Describe the background you want to generate..."
              value={backgroundPrompt}
              onChange={(e) => setBackgroundPrompt(e.target.value)}
              rows={3}
              maxLength={500}
              showCount
              className="background-prompt-input"
            />
            <div className="prompt-suggestions">
              <span className="suggestions-label">💡 Suggestions:</span>
              <div className="suggestion-tags">
                {['Sunset beach', 'Modern office', 'Fantasy forest', 'City skyline', 'Mountain landscape'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    size="small"
                    type="text"
                    className="suggestion-tag"
                    onClick={() => setBackgroundPrompt(suggestion.toLowerCase())}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {pixelcutOperation === 'upscale' && (
          <div className="modal-section">
            <div className="section-header">
              <h4 className="section-title">📈 Upscale Settings</h4>
            </div>
            <div className="upscale-options">
              <Select
                value={upscaleFactor}
                onChange={setUpscaleFactor}
                size="large"
                className="upscale-select"
                options={[
                  { label: '2× Upscale (Double Size)', value: 2 },
                  { label: '4× Upscale (4× Size)', value: 4 },
                  { label: '8× Upscale (8× Size)', value: 8 },
                ]}
              />
            </div>
          </div>
        )}

        {/* Operation Info */}
        <div className="modal-section">
          <Card className="operation-info-card">
            <div className="info-content">
              <div className="info-icon">
                {pixelcutOperation === 'removeBackground' && '✂️'}
                {pixelcutOperation === 'generateBackground' && '🎨'}
                {pixelcutOperation === 'upscale' && '📈'}
              </div>
              <div className="info-text">
                {pixelcutOperation === 'removeBackground' && 
                  'Remove the background from your image to create a transparent PNG file. Perfect for product photos, portraits, and graphics.'}
                {pixelcutOperation === 'generateBackground' && 
                  'Generate a new background for your image based on your description. The AI will create a seamless background that matches your vision.'}
                {pixelcutOperation === 'upscale' && 
                  'Increase the resolution of your image using AI upscaling technology. Great for improving image quality and preparing for print.'}
              </div>
            </div>
          </Card>
        </div>
      </Modal>

      {/* Rename Conversation Modal */}
      <Modal
        title="Rename Conversation"
        open={renameModalVisible}
        onOk={handleRenameConversation}
        onCancel={() => {
          setRenameModalVisible(false);
          setConversationToRename(null);
          setNewConversationTitle("");
        }}
        okText="Save"
        cancelText="Cancel"
        width={400}
      >
        <div style={{ margin: '16px 0' }}>
          <Text>Enter new name for the conversation:</Text>
          <Input
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
            onPressEnter={handleRenameConversation}
            placeholder="Conversation name..."
            maxLength={100}
            showCount
            style={{ marginTop: '8px' }}
          />
        </div>
      </Modal>
    </div>
  );
};