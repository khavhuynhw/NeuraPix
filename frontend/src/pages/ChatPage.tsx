import { useState, useRef, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Button,
  Input,
  Space,
  Avatar,
  Menu,
  Dropdown,
  Tooltip,
  Divider,
  Badge,
} from "antd";
import {
  SendOutlined,
  PlusOutlined,
  MessageOutlined,
  UserOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  CloseOutlined,
  BulbOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;
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
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      timestamp: new Date(),
      messages: [],
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    // Update conversation with user message
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              lastMessage: inputValue,
              timestamp: new Date(),
              title:
                conv.messages.length === 0
                  ? inputValue.slice(0, 30) + "..."
                  : conv.title,
            }
          : conv,
      ),
    );

    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${inputValue}". This is a simulated response. In a real implementation, this would be connected to an AI service like OpenAI's GPT API.`,
        sender: "assistant",
        timestamp: new Date(),
      };

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                lastMessage: assistantMessage.content,
                timestamp: new Date(),
              }
            : conv,
        ),
      );
      setIsTyping(false);
    }, 1500);
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
          collapsedWidth={isMobile ? 0 : 60}
          collapsed={sidebarCollapsed}
          className="chat-sidebar"
          breakpoint="md"
          onBreakpoint={(broken) => {
            if (broken) {
              setSidebarCollapsed(true);
            }
          }}
        >
          <div className="sidebar-content">
            {/* User Profile Header */}
            {!sidebarCollapsed && (
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
                <Button
                  type="text"
                  className="sidebar-toggle-btn"
                  onClick={() => setSidebarCollapsed(true)}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <rect
                      width="12.5"
                      height="10.5"
                      x="5.75"
                      y="6.75"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      rx="3.25"
                    />
                    <path fill="currentColor" d="M10 7h1.5v10H10z" />
                  </svg>
                </Button>
              </div>
            )}

            {/* Search and Workspace */}
            {!sidebarCollapsed && (
              <div className="navigation-section">
                <Button
                  className="search-btn"
                  icon={
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12">
                      <path
                        fill="currentColor"
                        d="M.693 5.145c0-.602.113-1.166.339-1.692.229-.53.544-.996.945-1.397A4.288 4.288 0 0 1 5.065.772c.606 0 1.171.113 1.698.339.53.225.995.54 1.396.945.401.401.715.867.94 1.397.23.526.344 1.09.344 1.692a4.318 4.318 0 0 1-.816 2.514l2.449 2.46a.803.803 0 0 1 .226.559c0 .15-.035.285-.103.407a.772.772 0 0 1-.688.392.845.845 0 0 1-.31-.059.728.728 0 0 1-.264-.172L7.472 8.781c-.344.229-.72.41-1.128.542-.405.13-.831.194-1.279.194a4.288 4.288 0 0 1-1.697-.339 4.4 4.4 0 0 1-1.391-.94 4.475 4.475 0 0 1-.945-1.39 4.301 4.301 0 0 1-.339-1.703Zm1.144 0c0 .447.083.866.247 1.256.169.39.402.734.699 1.032.297.293.64.524 1.031.692.39.169.807.253 1.251.253a3.14 3.14 0 0 0 1.257-.253 3.263 3.263 0 0 0 1.724-1.724c.169-.39.253-.809.253-1.256 0-.444-.084-.862-.253-1.252A3.283 3.283 0 0 0 6.322 2.17a3.14 3.14 0 0 0-1.257-.252c-.444 0-.86.084-1.251.252-.39.165-.734.396-1.031.693-.297.297-.53.64-.699 1.031-.164.39-.247.808-.247 1.252Z"
                      />
                    </svg>
                  }
                >
                  Tìm kiếm
                </Button>

                <div className="workspace-item active">
                  <div className="workspace-indicator"></div>
                  <span>Workspace</span>
                </div>
              </div>
            )}

            {/* Views Section */}
            {!sidebarCollapsed && (
              <div className="sidebar-section">
                <h3 className="section-title">Lượt xem</h3>
                <div className="section-item">
                  <div className="item-icon orange">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <rect
                        x="1"
                        y="1"
                        width="8"
                        height="8"
                        rx="4"
                        stroke="currentColor"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span>Tất cả phương tiện</span>
                </div>
              </div>
            )}

            {/* Conversations Section */}
            <div className="sidebar-section">
              {!sidebarCollapsed && (
                <h3 className="section-title">Cuộc trò chuyện</h3>
              )}

              {!sidebarCollapsed && (
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={createNewConversation}
                  className="new-collection-btn"
                >
                  Cuộc trò chuyện mới
                </Button>
              )}

              <div className="conversations-list">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      currentConversationId === conversation.id ? "active" : ""
                    }`}
                    onClick={() => setCurrentConversationId(conversation.id)}
                  >
                    {!sidebarCollapsed ? (
                      <>
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
                      </>
                    ) : (
                      <Tooltip title={conversation.title} placement="right">
                        <div className="conversation-collapsed">
                          <MessageOutlined />
                          {conversation.messages.length > 0 && (
                            <Badge
                              count={conversation.messages.length}
                              size="small"
                              className="message-count"
                            />
                          )}
                        </div>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsed sidebar - only toggle button */}
            {sidebarCollapsed && (
              <div className="collapsed-sidebar">
                <Button
                  type="text"
                  className="expand-sidebar-btn"
                  onClick={() => setSidebarCollapsed(false)}
                >
                  <MenuOutlined />
                </Button>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={createNewConversation}
                  className="new-chat-btn-collapsed"
                />
              </div>
            )}
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

          {/* Floating Sidebar Toggle */}
          {sidebarCollapsed && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setSidebarCollapsed(false)}
              className="floating-sidebar-toggle"
            />
          )}

          {/* Main Content Area */}
          <div className="main-content">
            <div className="content-container">
              <div className="gallery-area">
                <div className="gallery-grid">
                  <div className="image-item">
                    <div className="image-placeholder">
                      <img
                        src="https://picsum.photos/400/200?random=1"
                        alt="Generated content"
                        className="generated-image"
                      />
                      <div className="image-overlay">
                        <Button type="text" className="action-btn">
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
                        <Button type="text" className="action-btn">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 14.25V15.75C18 16.9926 16.9926 18 15.75 18H8.25C7.00736 18 6 16.9926 6 15.75V14.25M12 13.875V6M12 13.875L9.375 11.25M12 13.875L14.625 11.25"
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
                  <div className="image-item">
                    <div className="image-placeholder">
                      <img
                        src="https://picsum.photos/400/200?random=2"
                        alt="Generated content"
                        className="generated-image"
                      />
                      <div className="image-overlay">
                        <Button type="text" className="action-btn">
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
                        <Button type="text" className="action-btn">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M18 14.25V15.75C18 16.9926 16.9926 18 15.75 18H8.25C7.00736 18 6 16.9926 6 15.75V14.25M12 13.875V6M12 13.875L9.375 11.25M12 13.875L14.625 11.25"
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
                </div>
              </div>

              {/* Right Sidebar for Image Details */}
              <div className="image-details-sidebar">
                <div className="image-metadata">
                  <Text className="timestamp">17 ngày trước • Tải lên</Text>
                </div>
                <div className="image-actions">
                  <Button type="text" className="detail-action-btn">
                    <svg width="24" height="24" fill="none">
                      <path
                        stroke="#5C5C5E"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M6 8.297v7.46c0 .716.58 1.297 1.297 1.297h9.406c.716 0 1.297-.58 1.297-1.297v-5.514c0-.716-.58-1.297-1.297-1.297h-4.009c-.434 0-.839-.217-1.08-.578l-.526-.79A1.297 1.297 0 0 0 10.008 7h-2.71C6.58 7 6 7.58 6 8.297Z"
                      />
                    </svg>
                  </Button>
                  <Button type="text" className="detail-action-btn">
                    <svg viewBox="0 0 32 32" width="24" height="24">
                      <path
                        d="M12.255 25.572h7.638c.615 0 1.111-.181 1.49-.544.377-.362.582-.853.611-1.473l.566-12.026h.96a.65.65 0 0 0 .48-.199.669.669 0 0 0 .196-.49.656.656 0 0 0-.197-.48.65.65 0 0 0-.479-.198H8.621a.653.653 0 0 0-.475.198.65.65 0 0 0-.201.48c0 .194.067.357.2.49a.653.653 0 0 0 .476.199h.96l.565 12.033c.03.62.235 1.11.613 1.47.378.36.877.54 1.496.54Zm.149-1.373a.79.79 0 0 1-.588-.236.881.881 0 0 1-.25-.598l-.571-11.836h10.12l-.54 11.836a.875.875 0 0 1-.25.602.808.808 0 0 1-.596.232h-7.325Zm1.208-1.381a.56.56 0 0 0 .403-.145.473.473 0 0 0 .143-.379l-.253-8.798a.516.516 0 0 0-.158-.373.549.549 0 0 0-.392-.14.543.543 0 0 0-.396.144.502.502 0 0 0-.147.378l.253 8.791a.53.53 0 0 0 .158.382c.1.093.23.14.389.14Zm2.463 0a.56.56 0 0 0 .4-.144.493.493 0 0 0 .153-.376v-8.795c0-.155-.05-.28-.152-.376a.56.56 0 0 0-.401-.144.576.576 0 0 0-.406.144.487.487 0 0 0-.157.376v8.795c0 .155.052.28.157.376.104.096.24.144.406.144Zm2.454 0c.16 0 .29-.047.389-.14a.518.518 0 0 0 .157-.374l.254-8.8a.502.502 0 0 0-.146-.377.543.543 0 0 0-.398-.144.55.55 0 0 0-.391.14.522.522 0 0 0-.158.38l-.254 8.791c0 .157.049.283.148.38a.547.547 0 0 0 .399.144Zm-6.17-12.078h1.432V8.986c0-.224.073-.404.218-.54a.81.81 0 0 1 .573-.203h2.96c.243 0 .435.068.577.204a.71.71 0 0 1 .214.539v1.754h1.441V8.909c0-.621-.19-1.108-.568-1.46-.379-.351-.9-.527-1.565-.527h-3.157c-.665 0-1.185.176-1.561.528-.376.351-.565.838-.565 1.459v1.83Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Input Area */}
            <div className="bottom-input-container">
              <div className="input-form-container">
                <form className="generation-form">
                  <div className="prompt-input-area">
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tạo hoặc chỉnh sửa hình ảnh và video"
                      className="main-prompt-input"
                      autoSize={{ minRows: 1, maxRows: 4 }}
                    />
                  </div>
                  <div className="controls-area">
                    <div className="controls-row">
                      <div className="left-controls">
                        <div className="add-btn-container">
                          <Button type="text" className="control-btn add-btn">
                            <svg width="24" height="24" fill="none">
                              <path
                                fill="currentColor"
                                d="M7.096 11.77c0-.18.064-.335.193-.463a.622.622 0 0 1 .463-.2h3.592V7.521c0-.18.064-.333.193-.462A.632.632 0 0 1 12 6.865c.184 0 .34.065.469.194a.632.632 0 0 1 .193.462v3.586h3.586c.18 0 .334.067.463.2a.632.632 0 0 1 .193.463c0 .183-.064.34-.193.468a.642.642 0 0 1-.463.188h-3.586v3.597a.625.625 0 0 1-.193.457.639.639 0 0 1-.469.194.632.632 0 0 1-.463-.194.625.625 0 0 1-.193-.457v-3.597H7.752a.642.642 0 0 1-.463-.188.638.638 0 0 1-.193-.468Z"
                              />
                            </svg>
                          </Button>
                        </div>
                        <Button className="model-selector">
                          <span>Flux Kontext Pro</span>
                        </Button>
                        <Button className="count-selector">
                          <span>4</span>
                        </Button>
                        <Button className="ratio-selector">
                          <span>1:1</span>
                        </Button>
                      </div>
                      <Button
                        type="submit"
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
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Layout>
      </Layout>

      <style jsx>{`
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
          padding-right: 264px;
          position: relative;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          justify-content: center;
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
          left: 0;
          right: 0;
          z-index: 60;
          pointer-events: none;
        }

        .input-form-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px;
          pointer-events: none;
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
          background: transparent;
          border: none;
          color: white;
          font-size: 14px;
          grid-area: 1 / 1 / 2 / 2;
          line-height: 20px;
          max-height: 120px;
          outline: none;
          overflow-wrap: break-word;
          resize: none;
          white-space: pre-wrap;
          width: 100%;
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
