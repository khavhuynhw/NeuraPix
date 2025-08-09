import { useState, useRef, useEffect } from "react";
import {
  Layout,
  Typography,
  Button,
  Input,
  Avatar,
  Dropdown,
  Upload,
  message,
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
} from "@ant-design/icons";

const { Sider } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  timestamp: Date;
  messages: Message[];
}

export const ChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Welcome Chat",
      lastMessage: "Hello! How can I help you today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      messages: [
        {
          id: "1",
          content: "Hello! How can I help you today?",
          sender: "assistant",
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
        },
      ],
    },
    {
      id: "2",
      title: "React Components",
      lastMessage: "Can you help me with React components?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      messages: [
        {
          id: "2",
          content: "Can you help me with React components?",
          sender: "user",
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
      ],
    },
  ]);

  const [currentConversationId, setCurrentConversationId] = useState("1");
  const [inputValue, setInputValue] = useState("");

  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId,
  );

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

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



  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    setIsGenerating(true);
    setGeneratedImageUrl(null);

    // Simulate image generation
    setTimeout(() => {
      // Mock generated image URL
      setGeneratedImageUrl(`https://picsum.photos/400/200?random=${Date.now()}`);
      setIsGenerating(false);
    }, 3000);
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement("a");
      link.href = generatedImageUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImages(prev => [...prev, imageUrl]);
      message.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
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
    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationId,
    );
    setConversations(updatedConversations);

    if (conversationId === currentConversationId) {
      setCurrentConversationId(
        updatedConversations.length > 0 ? updatedConversations[0].id : "",
      );
    }
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
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
              <h3 className="section-title">Cuộc trò chuyện</h3>

              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={createNewConversation}
                className="new-collection-btn"
              >
                Cuộc trò chuyện mới
              </Button>

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
                            label: "Rename",
                          },
                          {
                            key: "delete",
                            icon: <DeleteOutlined />,
                            label: "Delete",
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
                  <span>Workspace</span>
                </div>
              </div>
            </h1>
            <div className="header-actions"></div>
          </header>



          {/* Main Content Area */}
          <div className="main-content">
            <div className="content-container">
              <div className="gallery-area">
                                 <div className="gallery-grid">
                   {isGenerating ? (
                     <div className="image-item">
                       <div className="image-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f8f8' }}>
                         <div style={{ textAlign: 'center', color: '#666' }}>
                           <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
                           <div>Generating image...</div>
                         </div>
                       </div>
                     </div>
                   ) : generatedImageUrl ? (
                     <div className="image-item">
                       <div className="image-placeholder">
                         <img
                           src={generatedImageUrl}
                           alt="Generated content"
                           className="generated-image"
                         />
                         <div className="image-overlay">
                           <Button type="text" className="action-btn" onClick={handleDownload}>
                             <svg
                               width="24"
                               height="24"
                               viewBox="0 0 24 24"
                               fill="none"
                             >
                               <path
                                 d="M18 14.25V15.75C18 16.9926 16.9926 18 15.75 18H8.25C7.00736 18 6 16.9926 6 15.75V14.25"
                                 stroke="currentColor"
                                 strokeWidth="1.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                               />
                               <path
                                 d="M12 6V13.875M12 6L9.375 8.625M12 6L14.625 8.625"
                                 stroke="currentColor"
                                 strokeWidth="1.5"
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                               />
                             </svg>
                           </Button>
                         </div>
                       </div>
                     </div>
                   ) : null}
                 </div>
              </div>


            </div>

            {/* Fixed Bottom Input Area */}
            <div className="bottom-input-container">
              <div className="input-form-container">
                <div className="generation-form">
                  {/* Uploaded Images Display */}
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images-area">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="uploaded-image-item">
                          <img src={imageUrl} alt={`Uploaded ${index + 1}`} className="uploaded-image" />
                          <Button
                            type="text"
                            size="small"
                            className="remove-image-btn"
                            onClick={() => removeUploadedImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="prompt-input-area">
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Describe the image you want to generate..."
                      className="main-prompt-input"
                      autoSize={{ minRows: 1, maxRows: 4 }}
                    />
                  </div>
                  <div className="controls-area">
                    <div className="controls-row">
                      <div className="left-controls">
                        <Upload
                          beforeUpload={handleImageUpload}
                          accept="image/*"
                          showUploadList={false}
                          multiple={false}
                        >
                          <Button type="text" className="upload-btn">
                            <PictureOutlined style={{ marginRight: 6 }} />
                            Add Photo
                          </Button>
                        </Upload>
                      </div>
                      {isGenerating ? (
                        <Button
                          className="generate-btn"
                          disabled
                        >
                          <svg
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 12 12"
                          >
                            <path
                              fill="currentColor"
                              d="M6 1a5 5 0 0 1 5 5c0 2.76-2.5 5-5 5S1 8.76 1 6a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3c0 1.66 1.5 3 3 3s3-1.34 3-3a3 3 0 0 0-3-3z"
                            />
                          </svg>
                        </Button>
                      ) : generatedImageUrl ? (
                        <Button
                          className="generate-btn"
                          onClick={handleDownload}
                        >
                          <svg
                            width="12"
                            height="14"
                            fill="none"
                            viewBox="0 0 12 14"
                          >
                            <path
                              fill="currentColor"
                              d="M6 1v8.5L9.5 6H12v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6h2.5L6 9.5V1z"
                            />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          className="generate-btn"
                          onClick={sendMessage}
                          disabled={!inputValue.trim()}
                        >
                          <svg
                            width="12"
                            height="14"
                            fill="none"
                            viewBox="0 0 12 14"
                          >
                            <path
                              fill="currentColor"
                              d="M6 13.613c-.296 0-.535-.095-.718-.287-.182-.187-.273-.435-.273-.745V5l.102-2.57.568.382-1.983 2.29-1.538 1.532a1.2 1.2 0 0 1-.314.225.89.89 0 0 1-.39.082.931.931 0 0 1-.677-.266.934.934 0 0 1-.266-.69c0-.265.102-.502.307-.712L5.268.816a.948.948 0 0 1 .329-.212 1.03 1.03 0 0 1 .8 0c.132.05.243.121.334.212l4.45 4.457c.206.21.308.447.308.711a.922.922 0 0 1-.943.957.935.935 0 0 1-.397-.082 1.096 1.096 0 0 1-.307-.225L8.297 5.103l-1.983-2.29.568-.383L6.984 5v7.581c0 .31-.09.558-.273.745a.937.937 0 0 1-.711.287Z"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
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

        .content-container {
          flex: 1;
          display: flex;
          overflow: auto;
          padding: 32px 32px 128px 32px;
          position: relative;
        }

        .gallery-area {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .gallery-grid {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1008px;
          margin: 0 auto;
        }

        .image-item {
          position: relative;
          aspect-ratio: 2.07524 / 1;
          background: #f8f8f8;
          cursor: pointer;
          isolation: isolate;
          border-radius: 8px;
          overflow: hidden;
        }

        .generated-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          position: absolute;
          top: 0;
          left: 0;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.3),
            rgba(0, 0, 0, 0)
          );
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 4px;
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .image-item:hover .image-overlay {
          display: flex;
          opacity: 1;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          color: white;
        }

        .image-details-sidebar {
          position: absolute;
          right: 0;
          top: 16px;
          width: 248px;
          padding-left: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transform: translateY(16px);
        }

        .image-metadata {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .timestamp {
          color: #a8a8a8;
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;
        }

        .image-actions {
          display: flex;
          gap: 4px;
          background: linear-gradient(to top, #ffffff 50%, rgba(0, 0, 0, 0));
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding-top: 16px;
        }

        .detail-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.8);
          color: #5c5c5e;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .detail-action-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          color: #5c5c5e;
        }

        .bottom-input-container {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          z-index: 60;
          pointer-events: none;
          width: 100%;
          max-width: 600px;
        }

        .input-form-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          pointer-events: auto;
          position: relative;
          width: 100%;
        }

        .generation-form {
          background: #000000;
          border-radius: 24px;
          box-shadow:
            rgba(0, 0, 0, 0) 0px 0px 0px 0px,
            rgba(0, 0, 0, 0.1) 0px 10px 15px -3px,
            rgba(0, 0, 0, 0.1) 0px 4px 6px -4px;
          color: white;
          display: flex;
          flex-direction: column;
          isolation: isolate;
          min-height: 40px;
          padding: 12px 16px;
          position: relative;
          max-width: 540px;
          width: 100%;
          pointer-events: auto;
        }

        .prompt-input-area {
          color: white;
          display: grid;
          font-size: 14px;
          line-height: 20px;
        }

        .main-prompt-input {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-size: 14px;
          grid-area: 1 / 1 / 2 / 2;
          line-height: 20px;
          max-height: 120px;
          outline: none !important;
          overflow-wrap: break-word;
          resize: none;
          white-space: pre-wrap;
          width: 100%;
          box-shadow: none !important;
          pointer-events: auto !important;
        }

        .main-prompt-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .main-prompt-input:focus {
          box-shadow: none;
          border: none;
        }

        .controls-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }

        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }

        .left-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: -4px;
        }

        .add-btn-container {
          width: 32px;
          height: 32px;
        }

        .control-btn {
          height: 32px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          line-height: 20px;
          text-align: center;
          white-space: nowrap;
          position: relative;
          z-index: 1;
          border: none;
          transition: all 0.2s ease;
        }

        .add-btn {
          width: 32px;
          background: #2f2f2f;
          color: white;
          border-color: #f5f5f5;
        }

        .add-btn:hover {
          background: #404040;
          color: white;
        }

        .model-selector,
        .count-selector,
        .ratio-selector {
          background: #2f2f2f;
          color: white;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          height: 32px;
          min-width: 40px;
          padding: 7px 12px;
          border: none;
          border-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          white-space: nowrap;
          user-select: none;
          position: relative;
          z-index: 1;
          transition: all 0.2s ease;
        }

        .model-selector span,
        .count-selector span,
        .ratio-selector span {
          color: white;
          font-size: 12px;
          font-weight: 500;
          line-height: 16px;
          position: relative;
          text-align: center;
          white-space: nowrap;
          user-select: none;
        }

        .count-selector span,
        .ratio-selector span {
          display: flow-root;
          overflow: hidden;
          text-align: left;
          pointer-events: none;
        }

        .count-selector span span,
        .ratio-selector span span {
          display: inline;
          pointer-events: none;
        }

        .model-selector:hover,
        .count-selector:hover,
        .ratio-selector:hover {
          background: #404040;
          color: white;
        }

        .generate-btn {
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background: white;
          color: black;
          border: none;
          border-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          line-height: 20px;
          margin-right: -4px;
          position: relative;
          text-align: center;
          white-space: nowrap;
          user-select: none;
          z-index: 1;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .generate-btn:hover:not(:disabled) {
          background: #f0f0f0;
          color: black;
          transform: scale(1.05);
        }

        .generate-btn:disabled {
          background: #404040;
          color: #808080;
          cursor: not-allowed;
        }

        .upload-btn {
          height: 32px;
          padding: 6px 12px;
          border-radius: 16px;
          background: #2f2f2f;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
          min-width: auto;
          white-space: nowrap;
        }

        .upload-btn:hover {
          background: #404040;
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .uploaded-images-area {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .uploaded-image-item {
          position: relative;
          display: inline-block;
        }

        .uploaded-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .remove-image-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ff4d4f;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          line-height: 1;
          min-width: 20px;
          padding: 0;
        }

        .remove-image-btn:hover {
          background: #ff7875;
          color: white;
        }

        @media (max-width: 768px) {
          .chat-header {
            padding: 0 16px;
          }

          .messages-container {
            padding: 16px;
          }

          .chat-input-container {
            padding: 12px 16px;
          }

          .message-content {
            max-width: 85%;
          }

          .suggested-prompts {
            flex-direction: column;
            align-items: center;
          }

          .prompt-suggestion {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};
