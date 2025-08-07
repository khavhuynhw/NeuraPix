import { useState, useRef, useEffect } from "react";
import {
  Layout,
  Typography,
  Button,
  Input,
  Avatar,
  Dropdown,
  Tooltip,
  Badge,
  List,
  Image,
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
  const [, setIsTyping] = useState(false);
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
    <div className="h-screen flex flex-col">
      <Layout className="h-screen bg-white">
        {/* Sidebar */}
        <Sider
          width={280}
          collapsedWidth={isMobile ? 0 : 60}
          collapsed={sidebarCollapsed}
          className="border-r border-gray-100 bg-gray-50 text-gray-600 h-screen relative z-[100]"
          breakpoint="md"
          onBreakpoint={(broken) => {
            if (broken) {
              setSidebarCollapsed(true);
            }
          }}
        >
          <div className="h-full flex flex-col px-2 pt-3 pb-6 overflow-hidden">
            {/* User Profile Header */}
            {!sidebarCollapsed && (
              <div className="flex items-center justify-between mb-3 h-8">
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomLeft"
                >
                  <div className="flex items-center cursor-pointer rounded-lg p-1 h-8 transition-colors duration-200 hover:bg-gray-100 hover:bg-opacity-10">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 mr-2">
                      <Avatar 
                        className="!bg-pink-500 !text-white font-semibold text-xs" 
                        size={24}
                      >
                        N
                      </Avatar>
                    </div>
                    <span className="text-gray-600 text-sm font-medium mr-1 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                      Personal
                    </span>
                    <div className="text-gray-600 w-2 h-2 ml-auto">
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
                  className="w-8 h-8 rounded-lg text-gray-600 border border-gray-200 bg-white flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
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
              <div className="flex flex-col gap-1 mb-4">
                <Button
                  className="flex items-center h-9 px-3 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm w-full text-left justify-start transition-all duration-200 hover:bg-gray-100"
                  icon={
                    <svg width="12" height="12" fill="none" viewBox="0 0 12 12" className="mr-3 -ml-2.5">
                      <path
                        fill="currentColor"
                        d="M.693 5.145c0-.602.113-1.166.339-1.692.229-.53.544-.996.945-1.397A4.288 4.288 0 0 1 5.065.772c.606 0 1.171.113 1.698.339.53.225.995.54 1.396.945.401.401.715.867.94 1.397.23.526.344 1.09.344 1.692a4.318 4.318 0 0 1-.816 2.514l2.449 2.46a.803.803 0 0 1 .226.559c0 .15-.035.285-.103.407a.772.772 0 0 1-.688.392.845.845 0 0 1-.31-.059.728.728 0 0 1-.264-.172L7.472 8.781c-.344.229-.72.41-1.128.542-.405.13-.831.194-1.279.194a4.288 4.288 0 0 1-1.697-.339 4.4 4.4 0 0 1-1.391-.94 4.475 4.475 0 0 1-.945-1.39 4.301 4.301 0 0 1-.339-1.703Zm1.144 0c0 .447.083.866.247 1.256.169.39.402.734.699 1.032.297.293.64.524 1.031.692.39.169.807.253 1.251.253a3.14 3.14 0 0 0 1.257-.253 3.263 3.263 0 0 0 1.724-1.724c.169-.39.253-.809.253-1.256 0-.444-.084-.862-.253-1.252A3.283 3.283 0 0 0 6.322 2.17a3.14 3.14 0 0 0-1.257-.252c-.444 0-.86.084-1.251.252-.39.165-.734.396-1.031.693-.297.297-.53.64-.699 1.031-.164.39-.247.808-.247 1.252Z"
                      />
                    </svg>
                  }
                >
                  Tìm kiếm
                </Button>

                <div className="flex items-center h-9 px-3 rounded-lg cursor-pointer relative overflow-hidden w-full transition-all duration-200 bg-blue-50 border border-blue-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-gray-600 text-sm font-medium">Workspace</span>
                </div>
              </div>
            )}

            {/* Views Section */}
            {!sidebarCollapsed && (
              <div className="mb-4">
                <h3 className="text-gray-600 text-xs font-medium mb-2 pl-1 h-6 flex items-center">
                  Lượt xem
                </h3>
                <div className="flex items-center h-9 px-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100">
                  <div className="w-5 h-5 flex items-center justify-center mr-2 text-orange-500">
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
                  <span className="text-gray-600 text-sm">Tất cả phương tiện</span>
                </div>
              </div>
            )}

            {/* Conversations Section */}
            <div className="mb-4 flex-1">
              {!sidebarCollapsed && (
                <h3 className="text-gray-600 text-xs font-medium mb-2 pl-1 h-6 flex items-center">
                  Cuộc trò chuyện
                </h3>
              )}

              {!sidebarCollapsed && (
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={createNewConversation}
                  className="flex items-center h-9 px-1 pl-3 rounded-lg bg-white border border-gray-200 text-gray-600 text-sm w-full text-left justify-start mb-2 transition-all duration-200 hover:bg-gray-100"
                >
                  Cuộc trò chuyện mới
                </Button>
              )}

              <div className="flex-1 overflow-y-auto scrollbar-none">
                <List
                  className="!p-0"
                  dataSource={conversations}
                  renderItem={(conversation) => (
                    <List.Item
                      key={conversation.id}
                      className={`!p-2 !px-3 rounded-lg cursor-pointer transition-all duration-200 !mb-0.5 flex items-start justify-between !border-transparent ${
                        currentConversationId === conversation.id 
                          ? "!bg-blue-50 !border-blue-100" 
                          : "hover:!bg-gray-100"
                      }`}
                      onClick={() => setCurrentConversationId(conversation.id)}
                      actions={!sidebarCollapsed ? [
                        <Dropdown
                          key="more"
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
                            className="opacity-0 transition-opacity duration-200 w-5 h-5 p-0 text-gray-500 bg-transparent border-none group-hover:opacity-100 hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      ] : undefined}
                    >
                      {!sidebarCollapsed ? (
                        <List.Item.Meta
                          title={
                            <Text className="!block !font-medium !text-gray-600 !mb-0.5 !text-sm !leading-5">
                              {conversation.title}
                            </Text>
                          }
                          description={
                            <div className="space-y-0.5">
                              {conversation.lastMessage && (
                                <Text className="!block !text-gray-400 !text-xs !mb-0.5 !whitespace-nowrap !overflow-hidden !text-ellipsis">
                                  {conversation.lastMessage.slice(0, 40)}...
                                </Text>
                              )}
                              <Text className="!text-gray-400 !text-xs">
                                {conversation.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Text>
                            </div>
                          }
                        />
                      ) : (
                        <Tooltip title={conversation.title} placement="right">
                          <div className="flex flex-col items-center gap-1 relative text-gray-500 text-base w-full justify-center">
                            <MessageOutlined />
                            {conversation.messages.length > 0 && (
                              <Badge
                                count={conversation.messages.length}
                                size="small"
                                className="absolute -top-2 -right-2"
                              />
                            )}
                          </div>
                        </Tooltip>
                      )}
                    </List.Item>
                  )}
                />
              </div>
            </div>

            {/* Collapsed sidebar - only toggle button */}
            {sidebarCollapsed && (
              <div className="flex flex-col items-center gap-3 py-3">
                <Button
                  type="text"
                  className="w-10 h-10 rounded-lg text-gray-600 bg-white border border-gray-200 flex items-center justify-center transition-all duration-200 hover:bg-gray-100"
                  onClick={() => setSidebarCollapsed(false)}
                >
                  <MenuOutlined />
                </Button>
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={createNewConversation}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center border-none transition-all duration-200 hover:from-blue-400 hover:to-blue-600 hover:-translate-y-px hover:shadow-lg hover:shadow-blue-500/30"
                />
              </div>
            )}
          </div>
        </Sider>

        {/* Main Chat Area */}
        <Layout className="flex flex-col h-screen">
          {/* Chat Header */}
          <header className="flex items-center justify-end bg-white border-b border-gray-200 h-14 px-4 md:px-4 flex-shrink-0">
            <h1 className="text-sm font-medium m-0">
              <div className="flex items-center text-sm font-medium">
                <div className="flex items-center cursor-pointer rounded-lg py-1 px-2 -ml-2 transition-all duration-150 ease-out hover:bg-black hover:bg-opacity-5">
                  <div className="text-blue-500 mr-2 w-2.5 h-2.5 flex items-center justify-center">
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
                  <span className="text-gray-800 text-sm font-medium">Workspace</span>
                </div>
              </div>
            </h1>
            <div className="flex items-center gap-2 ml-auto"></div>
          </header>

          {/* Floating Sidebar Toggle */}
          {sidebarCollapsed && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setSidebarCollapsed(false)}
              className="fixed top-5 left-5 z-[1000] w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-lg text-gray-600 flex items-center justify-center transition-all duration-200 hover:bg-gray-100 hover:shadow-xl"
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
            <div className="flex-1 flex overflow-auto py-8 px-4 md:px-8 pb-32 relative">
              <div className="flex-1 pr-66 relative">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center max-w-[1008px] mx-auto">
                  <div className="relative cursor-pointer isolate rounded-lg overflow-hidden group" style={{ aspectRatio: "2.07524 / 1" }}>
                    <Image
                      src="https://picsum.photos/400/200?random=1"
                      alt="Generated content"
                      className="w-full h-full object-contain rounded-lg"
                      preview={{
                        mask: <div className="bg-black/20">预览</div>,
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent hidden group-hover:flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out">
                      <Tooltip title="下载">
                        <Button
                          type="text"
                          className="w-8 h-8 rounded-md bg-black/80 text-white border-none flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:text-white"
                        >
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
                      </Tooltip>
                      <Tooltip title="分享">
                        <Button
                          type="text"
                          className="w-8 h-8 rounded-md bg-black/80 text-white border-none flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:text-white"
                        >
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
                      </Tooltip>
                    </div>
                  </div>
                  <div className="relative cursor-pointer isolate rounded-lg overflow-hidden group" style={{ aspectRatio: "2.07524 / 1" }}>
                    <Image
                      src="https://picsum.photos/400/200?random=2"
                      alt="Generated content"
                      className="w-full h-full object-contain rounded-lg"
                      preview={{
                        mask: <div className="bg-black/20">预览</div>,
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent hidden group-hover:flex items-center justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out">
                      <Tooltip title="下载">
                        <Button
                          type="text"
                          className="w-8 h-8 rounded-md bg-black/80 text-white border-none flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:text-white"
                        >
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
                      </Tooltip>
                      <Tooltip title="分享">
                        <Button
                          type="text"
                          className="w-8 h-8 rounded-md bg-black/80 text-white border-none flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:text-white"
                        >
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
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar for Image Details */}
              <div className="absolute right-0 top-4 w-62 pl-2 flex flex-col gap-2 translate-y-4">
                <div className="flex flex-col gap-1">
                  <Text className="text-gray-400 text-xs font-medium leading-4">
                    17 ngày trước • Tải lên
                  </Text>
                </div>
                <div className="flex gap-1 bg-gradient-to-t from-white via-white/50 to-transparent opacity-0 transition-opacity duration-200 ease-out pt-4">
                  <Button
                    type="text"
                    className="w-8 h-8 rounded-lg bg-black/80 text-gray-600 border-none flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:text-gray-600"
                  >
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
                  <Button
                    type="text"
                    className="w-8 h-8 rounded-lg bg-black/80 text-gray-600 border-none flex items-center justify-center transition-all duration-200 hover:bg-black/90 hover:text-gray-600"
                  >
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
            <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none">
              <div className="flex flex-col items-center py-4 pointer-events-none relative w-full">
                <form className="bg-black rounded-3xl shadow-lg text-white flex flex-col isolate min-h-10 py-3 px-4 relative max-w-[540px] w-full mx-4 md:mx-0 pointer-events-auto">
                  <div className="text-white grid text-sm leading-5">
                    <TextArea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Tạo hoặc chỉnh sửa hình ảnh và video"
                      className="bg-transparent border-none text-white text-sm grid-area-[1/1/2/2] leading-5 max-h-[120px] outline-none overflow-wrap-break-word resize-none whitespace-pre-wrap w-full !bg-transparent !border-none !shadow-none placeholder:text-white/60 focus:!bg-transparent focus:!border-none focus:!shadow-none"
                      autoSize={{ minRows: 1, maxRows: 4 }}
                    />
                  </div>
                  <div className="flex flex-col gap-3 mt-4">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2 -ml-1">
                        <div className="w-8 h-8">
                          <Button
                            type="text"
                            className="h-8 rounded-full inline-flex items-center justify-center text-sm font-semibold leading-5 text-center whitespace-nowrap relative z-[1] border-none transition-all duration-200 w-8 bg-gray-700 text-white border-gray-100 hover:bg-gray-600 hover:text-white"
                          >
                            <svg width="24" height="24" fill="none">
                              <path
                                fill="currentColor"
                                d="M7.096 11.77c0-.18.064-.335.193-.463a.622.622 0 0 1 .463-.2h3.592V7.521c0-.18.064-.333.193-.462A.632.632 0 0 1 12 6.865c.184 0 .34.065.469.194a.632.632 0 0 1 .193.462v3.586h3.586c.18 0 .334.067.463.2a.632.632 0 0 1 .193.463c0 .183-.064.34-.193.468a.642.642 0 0 1-.463.188h-3.586v3.597a.625.625 0 0 1-.193.457.639.639 0 0 1-.469.194.632.632 0 0 1-.463-.194.625.625 0 0 1-.193-.457v-3.597H7.752a.642.642 0 0 1-.463-.188.638.638 0 0 1-.193-.468Z"
                              />
                            </svg>
                          </Button>
                        </div>
                        <Button className="bg-gray-700 text-white rounded-2xl text-xs font-medium h-8 min-w-10 px-3 border-none border-gray-100 flex items-center justify-center text-center whitespace-nowrap select-none relative z-[1] transition-all duration-200 hover:bg-gray-600 hover:text-white">
                          <span className="text-white text-xs font-medium leading-4 relative text-center whitespace-nowrap select-none">
                            Flux Kontext Pro
                          </span>
                        </Button>
                        <Button className="bg-gray-700 text-white rounded-2xl text-xs font-medium h-8 min-w-10 px-3 border-none border-gray-100 flex items-center justify-center text-center whitespace-nowrap select-none relative z-[1] transition-all duration-200 hover:bg-gray-600 hover:text-white">
                          <span className="text-white text-xs font-medium leading-4 relative text-left whitespace-nowrap select-none flow-root overflow-hidden pointer-events-none">
                            <span className="inline pointer-events-none">4</span>
                          </span>
                        </Button>
                        <Button className="bg-gray-700 text-white rounded-2xl text-xs font-medium h-8 min-w-10 px-3 border-none border-gray-100 flex items-center justify-center text-center whitespace-nowrap select-none relative z-[1] transition-all duration-200 hover:bg-gray-600 hover:text-white">
                          <span className="text-white text-xs font-medium leading-4 relative text-left whitespace-nowrap select-none flow-root overflow-hidden pointer-events-none">
                            <span className="inline pointer-events-none">1:1</span>
                          </span>
                        </Button>
                      </div>
                      <Button
                        className="w-8 h-8 rounded-full bg-white text-black border-none border-gray-100 flex items-center justify-center text-sm font-semibold leading-5 -mr-1 relative text-center whitespace-nowrap select-none z-[1] cursor-pointer transition-all duration-200 hover:bg-gray-100 hover:text-black hover:scale-105 disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
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
    </div>
  );
};
