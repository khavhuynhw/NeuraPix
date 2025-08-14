import { useState, useRef  } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Form,
  Input,
  Select,
  Slider,
  Space,
  Divider,
  Image,
  Tag,
  Progress,
  Modal,
  Badge,
  Spin,
  message,
} from "antd";

import {
  PictureOutlined,
  DownloadOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  StarOutlined,
  ReloadOutlined,
  BulbOutlined,
  FireOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
  CrownOutlined,
  TrophyOutlined,
  StarFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Mock data
const artStyles = [
  { value: "realistic", label: "Realistic", popular: true, icon: "📸" },
  { value: "digital-art", label: "Digital Art", popular: true, icon: "🎨" },
  { value: "oil-painting", label: "Oil Painting", popular: false, icon: "🖼️" },
  { value: "watercolor", label: "Watercolor", popular: false, icon: "🎭" },
  { value: "anime", label: "Anime", popular: true, icon: "🌸" },
  { value: "cyberpunk", label: "Cyberpunk", popular: true, icon: "🤖" },
  { value: "fantasy", label: "Fantasy", popular: false, icon: "🔮" },
  { value: "abstract", label: "Abstract", popular: false, icon: "🌀" },
  { value: "vintage", label: "Vintage", popular: false, icon: "📻" },
  { value: "minimalist", label: "Minimalist", popular: false, icon: "⬜" },
];

const aspectRatios = [
  { value: "1:1", label: "Square (1:1)", width: 512, height: 512, icon: "⬜" },
  {
    value: "16:9",
    label: "Landscape (16:9)",
    width: 768,
    height: 432,
    icon: "📺",
  },
  {
    value: "9:16",
    label: "Portrait (9:16)",
    width: 432,
    height: 768,
    icon: "📱",
  },
  {
    value: "4:3",
    label: "Standard (4:3)",
    width: 640,
    height: 480,
    icon: "🖥️",
  },
  { value: "3:2", label: "Photo (3:2)", width: 640, height: 427, icon: "📷" },
];

const promptSuggestions = [
  "A majestic dragon soaring through a starlit sky",
  "Futuristic cityscape at sunset with flying cars",
  "Serene mountain lake reflecting autumn colors",
  "Abstract geometric patterns in vibrant colors",
  "Cozy bookstore with warm lighting",
  "Magical forest with glowing mushrooms",
  "Vintage robot in a steampunk workshop",
  "Minimalist architecture with clean lines",
];

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  quality: number;
  liked: boolean;
  timestamp: Date;
}

export const GeneratorPage = () => {
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [usageCount, setUsageCount] = useState(234);
  const [usageLimit] = useState(500);

  const promptInputRef = useRef<any>(null);



  const handleGenerate = async (values: any) => {
    if (!values.prompt?.trim()) {
      message.warning("Please enter a prompt to generate an image");
      return;
    }

    setIsGenerating(true);

    // Simulate API call delay
    setTimeout(() => {
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://picsum.photos/512/512?random=${Date.now()}`,
        prompt: values.prompt,
        style: values.style || "realistic",
        aspectRatio: values.aspectRatio || "1:1",
        quality: values.quality || 80,
        liked: false,
        timestamp: new Date(),
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      setUsageCount((prev) => prev + 1);
      setIsGenerating(false);
      message.success("Image generated successfully!");

      // Clear the prompt
      form.setFieldValue("prompt", "");
    }, 3000);
  };



  const handlePromptSuggestion = (suggestion: string) => {
    form.setFieldValue("prompt", suggestion);
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
  };

  const toggleLike = (imageId: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, liked: !img.liked } : img,
      ),
    );
    message.success("Image liked!");
  };

  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `generated-image-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Download started!");
  };

  const handleShare = (image: GeneratedImage) => {
    navigator.clipboard.writeText(image.prompt);
    message.success("Prompt copied to clipboard!");
  };

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalVisible(true);
  };

  const handleDeleteImage = (imageId: string) => {
    setGeneratedImages((prev) => prev.filter((img) => img.id !== imageId));
    message.success("Image deleted!");
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 128px)",
        background:
          "linear-gradient(135deg, #f8fafc 0%, #f0f4f8 25%, #e2e8f0 50%, #f1f5f9 75%, #f8fafc 100%)",
        padding: "60px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
          radial-gradient(circle at 20% 20%, rgba(0, 121, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 199, 255, 0.03) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(0, 121, 255, 0.02) 0%, transparent 50%)
        `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Enhanced Page Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
              padding: "8px 20px",
              background:
                "linear-gradient(135deg, rgba(0, 121, 255, 0.08), rgba(0, 199, 255, 0.08))",
              borderRadius: 50,
              border: "1px solid rgba(0, 121, 255, 0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CrownOutlined style={{ color: "#0079FF", fontSize: 16 }} />
            <Text style={{ color: "#0079FF", fontWeight: 600, fontSize: 14 }}>
              Professional AI Studio
            </Text>
          </div>

          <Title
            level={1}
            style={{
              margin: "0 0 24px 0",
              color: "#1f2937",
              fontSize: "clamp(3rem, 6vw, 4.5rem)",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #1f2937 0%, #374151 50%, #0079FF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}
          >
            <PictureOutlined
              style={{
                marginRight: 20,
                color: "#0079FF",
                fontSize: "0.8em",
                filter: "drop-shadow(0 4px 8px rgba(0, 121, 255, 0.3))",
              }}
            />
            AI Image Generator
          </Title>

          <Paragraph
            style={{
              fontSize: 20,
              color: "#64748b",
              maxWidth: 700,
              margin: "0 auto 40px auto",
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Transform your imagination into stunning visuals with our
            cutting-edge AI. Create professional-quality images from simple text
            descriptions in seconds.
          </Paragraph>

          {/* Enhanced Usage Counter */}
          <Card
            style={{
              display: "inline-block",
              borderRadius: 20,
              border: "1px solid rgba(0, 121, 255, 0.15)",
              background:
                "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0, 121, 255, 0.1)",
              padding: "8px 24px",
            }}
          >
            <Space align="center" size="large">
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#0079FF",
                    display: "block",
                  }}
                >
                  {usageCount}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Generated
                </Text>
              </div>
              <Divider
                type="vertical"
                style={{ height: 40, borderColor: "rgba(0, 121, 255, 0.2)" }}
              />
              <div style={{ textAlign: "center" }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#10b981",
                    display: "block",
                  }}
                >
                  {usageLimit - usageCount}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Remaining
                </Text>
              </div>
              <Progress
                type="circle"
                percent={(usageCount / usageLimit) * 100}
                size={50}
                strokeColor={{
                  "0%": "#0079FF",
                  "100%": "#00C7FF",
                }}
                trailColor="rgba(0, 121, 255, 0.1)"
                strokeWidth={8}
                format={() => (
                  <TrophyOutlined style={{ color: "#0079FF", fontSize: 16 }} />
                )}
              />
            </Space>
          </Card>
        </div>

        <Row gutter={[32, 32]}>
          {/* Enhanced Generator Panel */}
          <Col xs={24} lg={10}>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <StarOutlined style={{ color: "#0079FF" }} />
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    Create Masterpiece
                  </span>
                </div>
              }
              style={{
                borderRadius: 24,
                border: "1px solid rgba(0, 121, 255, 0.1)",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))",
                backdropFilter: "blur(20px)",
                boxShadow: "0 20px 60px rgba(0, 121, 255, 0.08)",
                position: "sticky",
                top: 100,
                overflow: "hidden",
              }}
              headStyle={{
                background:
                  "linear-gradient(135deg, rgba(0, 121, 255, 0.05), rgba(0, 199, 255, 0.05))",
                border: "none",
                borderRadius: "24px 24px 0 0",
              }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleGenerate}
                initialValues={{
                  style: "realistic",
                  aspectRatio: "1:1",
                  quality: 80,
                }}
              >
                <Form.Item
                  label={
                    <Text strong style={{ fontSize: 16, color: "#1f2937" }}>
                      ✨ Describe your vision
                    </Text>
                  }
                  name="prompt"
                  rules={[{ required: true, message: "Please enter a prompt" }]}
                >
                  <TextArea
                    ref={promptInputRef}
                    rows={5}
                    placeholder="A breathtaking sunset over snow-capped mountains, with a crystal-clear lake reflecting the golden sky..."
                    style={{
                      fontSize: 15,
                      lineHeight: 1.6,
                      borderRadius: 16,
                      border: "2px solid rgba(0, 121, 255, 0.1)",
                      background: "rgba(248, 250, 252, 0.5)",
                      transition: "all 0.3s ease",
                      resize: "none",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#0079FF";
                      e.target.style.background = "rgba(255, 255, 255, 0.9)";
                      e.target.style.boxShadow =
                        "0 0 0 4px rgba(0, 121, 255, 0.1)";
                      e.target.style.transform = "translateY(-2px)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(0, 121, 255, 0.1)";
                      e.target.style.background = "rgba(248, 250, 252, 0.5)";
                      e.target.style.boxShadow = "none";
                      e.target.style.transform = "translateY(0)";
                    }}
                  />
                </Form.Item>

                {/* Enhanced Prompt Suggestions */}
                <div style={{ marginBottom: 32 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: 12,
                      display: "block",
                    }}
                  >
                    <BulbOutlined
                      style={{ color: "#f59e0b", marginRight: 8 }}
                    />
                    Quick inspiration:
                  </Text>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {promptSuggestions.slice(0, 4).map((suggestion, index) => (
                      <Tag
                        key={index}
                        style={{
                          cursor: "pointer",
                          border: "1px solid rgba(0, 121, 255, 0.2)",
                          color: "#0079FF",
                          background:
                            "linear-gradient(135deg, rgba(0, 121, 255, 0.05), rgba(0, 199, 255, 0.05))",
                          borderRadius: 20,
                          transition: "all 0.3s ease",
                          fontSize: 12,
                          padding: "6px 12px",
                          fontWeight: 500,
                        }}
                        onClick={() => handlePromptSuggestion(suggestion)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(0, 121, 255, 0.1), rgba(0, 199, 255, 0.1))";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0, 121, 255, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, rgba(0, 121, 255, 0.05), rgba(0, 199, 255, 0.05))";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {suggestion.slice(0, 25)}...
                      </Tag>
                    ))}
                  </div>
                </div>

                <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Text strong style={{ color: "#1f2937" }}>
                          🎨 Art Style
                        </Text>
                      }
                      name="style"
                    >
                      <Select
                        size="large"
                        style={{ borderRadius: 12 }}
                        dropdownStyle={{
                          borderRadius: 16,
                          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {artStyles.map((style) => (
                          <Option key={style.value} value={style.value}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Space>
                                <span style={{ fontSize: 16 }}>
                                  {style.icon}
                                </span>
                                <span>{style.label}</span>
                              </Space>
                              {style.popular && (
                                <Badge
                                  count={
                                    <FireOutlined
                                      style={{ color: "#ff4d4f", fontSize: 10 }}
                                    />
                                  }
                                />
                              )}
                            </div>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={
                        <Text strong style={{ color: "#1f2937" }}>
                          📐 Aspect Ratio
                        </Text>
                      }
                      name="aspectRatio"
                    >
                      <Select
                        size="large"
                        style={{ borderRadius: 12 }}
                        dropdownStyle={{
                          borderRadius: 16,
                          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {aspectRatios.map((ratio) => (
                          <Option key={ratio.value} value={ratio.value}>
                            <Space>
                              <span style={{ fontSize: 16 }}>{ratio.icon}</span>
                              <span>{ratio.label}</span>
                            </Space>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label={
                    <Text strong style={{ color: "#1f2937" }}>
                      ⚡ Quality Level
                    </Text>
                  }
                  name="quality"
                >
                  <Slider
                    min={20}
                    max={100}
                    step={20}
                    marks={{
                      20: {
                        label: "Draft",
                        style: {
                          color: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        },
                      },
                      40: {
                        label: "Good",
                        style: {
                          color: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        },
                      },
                      60: {
                        label: "High",
                        style: {
                          color: "#64748b",
                          fontSize: 12,
                          fontWeight: 500,
                        },
                      },
                      80: {
                        label: "Ultra",
                        style: {
                          color: "#0079FF",
                          fontSize: 12,
                          fontWeight: 600,
                        },
                      },
                      100: {
                        label: "Perfect",
                        style: {
                          color: "#0079FF",
                          fontSize: 12,
                          fontWeight: 600,
                        },
                      },
                    }}
                    trackStyle={{
                      background: "linear-gradient(90deg, #0079FF, #00C7FF)",
                      height: 6,
                    }}
                    handleStyle={{
                      borderColor: "#0079FF",
                      borderWidth: 3,
                      width: 20,
                      height: 20,
                      boxShadow: "0 4px 12px rgba(0, 121, 255, 0.3)",
                    }}
                    railStyle={{
                      backgroundColor: "rgba(0, 121, 255, 0.1)",
                      height: 6,
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: 40 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={isGenerating}
                    block
                    icon={
                      isGenerating ? <ThunderboltOutlined /> : <StarFilled style={{color: "gold",}}/>
                    }
                    style={{
                      height: 60,
                      fontSize: 18,
                      fontWeight: 700,
                      background: isGenerating
                        ? "linear-gradient(135deg, #94a3b8, #64748b)"
                        : "linear-gradient(135deg, #0079FF 0%, #0056B3 50%, #003D80 100%)",
                      border: "none",
                      borderRadius: 20,
                      boxShadow: isGenerating
                        ? "none"
                        : "0 8px 32px rgba(0, 121, 255, 0.4)",
                      transition: "all 0.4s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (!isGenerating) {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 40px rgba(0, 121, 255, 0.5)";
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #3399FF 0%, #0079FF 50%, #0056B3 100%)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isGenerating) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 32px rgba(0, 121, 255, 0.4)";
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #0079FF 0%, #0056B3 50%, #003D80 100%)";
                      }
                    }}
                  >
                    {isGenerating ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <Spin size="small" />
                        Creating your masterpiece...
                      </span>
                    ) : (
                      "Generate Masterpiece"
                    )}
                  </Button>
                </Form.Item>
              </Form>

              {isGenerating && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 0",
                    background:
                      "linear-gradient(135deg, rgba(0, 121, 255, 0.02), rgba(0, 199, 255, 0.02))",
                    borderRadius: 16,
                    margin: "20px 0",
                  }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        margin: "0 auto 16px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #0079FF, #00C7FF)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      <ThunderboltOutlined
                        style={{ color: "white", fontSize: 24 }}
                      />
                    </div>
                    <Text
                      style={{
                        color: "#374151",
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    >
                      AI is working its magic...
                    </Text>
                  </div>
                  <Progress
                    percent={75}
                    strokeColor={{
                      "0%": "#0079FF",
                      "50%": "#00C7FF",
                      "100%": "#0079FF",
                    }}
                    trailColor="rgba(0, 121, 255, 0.1)"
                    strokeWidth={8}
                    style={{ marginTop: 16 }}
                    showInfo={false}
                  />
                </div>
              )}
            </Card>
          </Col>

          {/* Enhanced Generated Images Gallery */}
          <Col xs={24} lg={14}>
            <div
              style={{
                marginBottom: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <Title
                  level={2}
                  style={{
                    margin: 0,
                    color: "#1f2937",
                    fontSize: 32,
                    fontWeight: 700,
                  }}
                >
                  🎨 Your Gallery
                </Title>
                <Text type="secondary" style={{ fontSize: 16 }}>
                  {generatedImages.length} amazing creations
                </Text>
              </div>
              {generatedImages.length > 0 && (
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    size="large"
                    style={{
                      borderRadius: 12,
                      border: "1px solid rgba(0, 121, 255, 0.2)",
                      background: "rgba(0, 121, 255, 0.05)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(0, 121, 255, 0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0, 121, 255, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(0, 121, 255, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Refresh
                  </Button>
                </Space>
              )}
            </div>

            {generatedImages.length === 0 ? (
              <Card
                style={{
                  borderRadius: 24,
                  textAlign: "center",
                  padding: "80px 40px",
                  background:
                    "linear-gradient(135deg, rgba(0, 121, 255, 0.02), rgba(0, 199, 255, 0.02))",
                  border: "2px dashed rgba(0, 121, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    margin: "0 auto 24px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, rgba(0, 121, 255, 0.1), rgba(0, 199, 255, 0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PictureOutlined style={{ fontSize: 48, color: "#0079FF" }} />
                </div>
                <Title level={3} style={{ color: "#374151", fontWeight: 600 }}>
                  Your creative journey starts here
                </Title>
                <Paragraph
                  style={{
                    color: "#64748b",
                    fontSize: 16,
                    maxWidth: 400,
                    margin: "16px auto",
                  }}
                >
                  Transform your imagination into stunning visuals. Enter a
                  prompt above and watch the magic happen!
                </Paragraph>
              </Card>
            ) : (
              <Row gutter={[20, 20]}>
                {generatedImages.map((image) => (
                  <Col xs={12} sm={8} md={6} key={image.id}>
                    <Card
                      hoverable
                      cover={
                        <div
                          style={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "16px 16px 0 0",
                          }}
                        >
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            style={{
                              width: "100%",
                              height: 200,
                              objectFit: "cover",
                              cursor: "pointer",
                              transition: "transform 0.3s ease",
                            }}
                            preview={false}
                            onClick={() => handleImageClick(image)}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              display: "flex",
                              gap: 6,
                            }}
                          >
                            <Tag
                              style={{
                                background: "rgba(0, 0, 0, 0.7)",
                                border: "none",
                                color: "white",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 500,
                                backdropFilter: "blur(10px)",
                              }}
                            >
                              {
                                artStyles.find((s) => s.value === image.style)
                                  ?.icon
                              }{" "}
                              {image.style}
                            </Tag>


                          </div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              background:
                                "linear-gradient(transparent, rgba(0, 0, 0, 0.8))",
                              padding: "30px 12px 12px",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              borderRadius: "0 0 16px 16px",
                            }}
                            className="image-overlay"
                          >
                            <Space>
                              <Button
                                type="text"
                                icon={
                                  image.liked ? (
                                    <HeartFilled style={{ color: "#ff4d4f" }} />
                                  ) : (
                                    <HeartOutlined />
                                  )
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLike(image.id);
                                }}
                                style={{
                                  color: "white",
                                  background: "rgba(255, 255, 255, 0.2)",
                                  borderRadius: "50%",
                                  width: 36,
                                  height: 36,
                                  backdropFilter: "blur(10px)",
                                }}
                              />
                              <Button
                                type="text"
                                icon={<ShareAltOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(image);
                                }}
                                style={{
                                  color: "white",
                                  background: "rgba(255, 255, 255, 0.2)",
                                  borderRadius: "50%",
                                  width: 36,
                                  height: 36,
                                  backdropFilter: "blur(10px)",
                                }}
                              />
                              <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(image);
                                }}
                                style={{
                                  color: "white",
                                  background: "rgba(255, 255, 255, 0.2)",
                                  borderRadius: "50%",
                                  width: 36,
                                  height: 36,
                                  backdropFilter: "blur(10px)",
                                }}
                              />
                            </Space>
                          </div>
                        </div>
                      }
                      style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        transition: "all 0.4s ease",
                        border: "1px solid rgba(0, 121, 255, 0.1)",
                        background: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(10px)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-8px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                          "0 20px 60px rgba(0, 121, 255, 0.15)";
                        const overlay = e.currentTarget.querySelector(
                          ".image-overlay",
                        ) as HTMLElement;
                        const img = e.currentTarget.querySelector(
                          "img",
                        ) as HTMLElement;
                        if (overlay) overlay.style.opacity = "1";
                        if (img) img.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 20px rgba(0, 0, 0, 0.1)";
                        const overlay = e.currentTarget.querySelector(
                          ".image-overlay",
                        ) as HTMLElement;
                        const img = e.currentTarget.querySelector(
                          "img",
                        ) as HTMLElement;
                        if (overlay) overlay.style.opacity = "0";
                        if (img) img.style.transform = "scale(1)";
                      }}
                    >
                      <Card.Meta
                        description={
                          <div>
                            <Text
                              ellipsis={{ tooltip: image.prompt }}
                              style={{
                                fontSize: 13,
                                color: "#4b5563",
                                fontWeight: 500,
                                lineHeight: 1.4,
                              }}
                            >
                              {image.prompt}
                            </Text>
                            <div
                              style={{
                                marginTop: 12,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                type="secondary"
                                style={{ fontSize: 11, fontWeight: 500 }}
                              >
                                {image.timestamp.toLocaleTimeString()}
                              </Text>
                              <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                                onClick={() => handleDeleteImage(image.id)}
                                style={{
                                  opacity: 0.6,
                                  borderRadius: "50%",
                                  width: 24,
                                  height: 24,
                                }}
                              />
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>

        {/* Enhanced Image Detail Modal */}
        <Modal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={900}
          style={{ top: 20 }}
          destroyOnClose
          styles={{
            content: {
              borderRadius: 24,
              overflow: "hidden",
              padding: 0,
            },
          }}
        >
          {selectedImage && (
            <div>
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 32,
                  background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                  padding: 20,
                  borderRadius: "24px 24px 0 0",
                }}
              >
                <Image
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  style={{
                    maxWidth: "100%",
                    borderRadius: 16,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </div>
              <div style={{ padding: "0 32px 32px" }}>
                <Card
                  style={{
                    borderRadius: 16,
                    border: "1px solid rgba(0, 121, 255, 0.1)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong style={{ fontSize: 16, color: "#374151" }}>
                        Prompt:
                      </Text>
                      <Paragraph
                        copyable
                        style={{
                          marginTop: 12,
                          padding: 16,
                          background: "rgba(0, 121, 255, 0.02)",
                          borderRadius: 12,
                          border: "1px solid rgba(0, 121, 255, 0.1)",
                          fontSize: 15,
                          lineHeight: 1.6,
                        }}
                      >
                        {selectedImage.prompt}
                      </Paragraph>
                    </div>
                    <Row gutter={24}>
                      <Col xs={8}>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          Style:
                        </Text>
                        <br />
                        <Tag
                          style={{
                            marginTop: 4,
                            padding: "4px 12px",
                            borderRadius: 16,
                            border: "1px solid rgba(0, 121, 255, 0.2)",
                            background: "rgba(0, 121, 255, 0.05)",
                            color: "#0079FF",
                            fontWeight: 500,
                          }}
                        >
                          {
                            artStyles.find(
                              (s) => s.value === selectedImage.style,
                            )?.icon
                          }{" "}
                          {selectedImage.style}
                        </Tag>
                      </Col>
                      <Col xs={8}>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          Aspect Ratio:
                        </Text>
                        <br />
                        <Text style={{ fontWeight: 600, color: "#374151" }}>
                          {
                            aspectRatios.find(
                              (r) => r.value === selectedImage.aspectRatio,
                            )?.icon
                          }{" "}
                          {selectedImage.aspectRatio}
                        </Text>
                      </Col>
                      <Col xs={8}>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                          Quality:
                        </Text>
                        <br />
                        <Text style={{ fontWeight: 600, color: "#374151" }}>
                          {selectedImage.quality}%
                        </Text>
                      </Col>
                    </Row>
                    <Space
                      style={{ width: "100%", justifyContent: "center" }}
                      size="large"
                    >
                      <Button
                        size="large"
                        icon={
                          selectedImage.liked ? (
                            <HeartFilled style={{ color: "#ff4d4f" }} />
                          ) : (
                            <HeartOutlined />
                          )
                        }
                        onClick={() => toggleLike(selectedImage.id)}
                        style={{
                          borderRadius: 12,
                          border: selectedImage.liked
                            ? "1px solid #ff4d4f"
                            : "1px solid rgba(0, 121, 255, 0.2)",
                          background: selectedImage.liked
                            ? "rgba(255, 77, 79, 0.05)"
                            : "rgba(0, 121, 255, 0.05)",
                        }}
                      >
                        {selectedImage.liked ? "Liked" : "Like"}
                      </Button>
                      <Button
                        size="large"
                        icon={<ShareAltOutlined />}
                        onClick={() => handleShare(selectedImage)}
                        style={{
                          borderRadius: 12,
                          border: "1px solid rgba(0, 121, 255, 0.2)",
                          background: "rgba(0, 121, 255, 0.05)",
                        }}
                      >
                        Share
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(selectedImage)}
                        style={{
                          background:
                            "linear-gradient(135deg, #0079FF, #0056B3)",
                          border: "none",
                          borderRadius: 12,
                          boxShadow: "0 8px 20px rgba(0, 121, 255, 0.3)",
                        }}
                      >
                        Download HD
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* Add CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(0, 121, 255, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(0, 121, 255, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(0, 121, 255, 0);
            }
          }
        `}
      </style>
    </div>
  );
};
