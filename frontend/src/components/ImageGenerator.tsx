import { useState } from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Slider,
  Row,
  Col,
  Form,
  Typography,
  Tag,
  Space,
  Image,
  Tooltip,
  message,
} from "antd";
import {
  StarOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  liked: boolean;
  style: string;
  quality: number;
}

export const ImageGenerator = () => {
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  const generateImage = async (values: any) => {
    if (!values.prompt?.trim()) {
      message.warning("Please enter a prompt to generate an image");
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: `https://picsum.photos/512/512?random=${Date.now()}`,
        prompt: values.prompt,
        timestamp: new Date(),
        liked: false,
        style: values.style || "realistic",
        quality: values.quality || 80,
      };

      setGeneratedImages((prev) => [newImage, ...prev]);
      message.success("Image generated successfully!");
      form.setFieldValue("prompt", "");
    } catch (error) {
      message.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLike = (id: string) => {
    setGeneratedImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, liked: !img.liked } : img)),
    );
    message.success("Added to favorites!");
  };

  const handleDownload = (_image: GeneratedImage) => {
    message.success("Download started!");
  };

  const handleShare = (image: GeneratedImage) => {
    navigator.clipboard.writeText(image.prompt);
    message.success("Prompt copied to clipboard!");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Main Generation Card */}
        <Card
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 121, 255, 0.05) 0%, rgba(0, 199, 255, 0.05) 100%)",
            border: "1px solid rgba(0, 121, 255, 0.2)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0, 121, 255, 0.1)",
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <Title level={2} style={{ margin: 0, color: "#0079FF" }}>
                <StarOutlined style={{ marginRight: 8 }} />
                Create Your Vision
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Transform your ideas into stunning visuals with AI
              </Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={generateImage}
              initialValues={{
                style: "realistic",
                aspectRatio: "square",
                quality: 80,
              }}
            >
              <Form.Item
                label={
                  <Text strong style={{ fontSize: 16 }}>
                    Describe what you want to create
                  </Text>
                }
                name="prompt"
                rules={[
                  { required: true, message: "Please enter your prompt" },
                ]}
              >
                <TextArea
                  placeholder="A serene landscape with mountains and a lake at sunset, digital art style..."
                  rows={4}
                  style={{
                    fontSize: 16,
                    borderColor: "rgba(0, 121, 255, 0.3)",
                  }}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item label="Style" name="style">
                    <Select
                      size="large"
                      style={{ borderColor: "rgba(0, 121, 255, 0.3)" }}
                    >
                      <Select.Option value="realistic">Realistic</Select.Option>
                      <Select.Option value="artistic">Artistic</Select.Option>
                      <Select.Option value="anime">Anime</Select.Option>
                      <Select.Option value="abstract">Abstract</Select.Option>
                      <Select.Option value="vintage">Vintage</Select.Option>
                      <Select.Option value="cyberpunk">Cyberpunk</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Aspect Ratio" name="aspectRatio">
                    <Select
                      size="large"
                      style={{ borderColor: "rgba(0, 121, 255, 0.3)" }}
                    >
                      <Select.Option value="square">Square (1:1)</Select.Option>
                      <Select.Option value="landscape">
                        Landscape (16:9)
                      </Select.Option>
                      <Select.Option value="portrait">
                        Portrait (9:16)
                      </Select.Option>
                      <Select.Option value="wide">Wide (21:9)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Quality" name="quality">
                    <Slider
                      min={20}
                      max={100}
                      step={10}
                      trackStyle={{ backgroundColor: "#0079FF" }}
                      handleStyle={{ borderColor: "#0079FF" }}
                      marks={{
                        20: "20%",
                        50: "50%",
                        80: "80%",
                        100: "100%",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isGenerating}
                  icon={isGenerating ? <LoadingOutlined /> : <StarOutlined />}
                  style={{
                    width: "100%",
                    height: 50,
                    fontSize: 16,
                    background:
                      "linear-gradient(135deg, #0079FF 0%, #0056B3 100%)",
                    border: "none",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0, 121, 255, 0.3)",
                  }}
                >
                  {isGenerating
                    ? "Generating your masterpiece..."
                    : "Generate Image"}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>

        {/* Generated Images Gallery */}
        {generatedImages.length > 0 && (
          <div>
            <Title level={2} style={{ marginBottom: 24, color: "#0079FF" }}>
              Your Creations
            </Title>
            <Row gutter={[24, 24]}>
              {generatedImages.map((image) => (
                <Col xs={24} sm={12} lg={8} key={image.id}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ position: "relative", overflow: "hidden" }}>
                        <Image
                          src={image.url}
                          alt={image.prompt}
                          style={{
                            width: "100%",
                            height: 250,
                            objectFit: "cover",
                          }}
                          preview={{
                            mask: (
                              <Space>
                                <Button
                                  type="text"
                                  icon={
                                    image.liked ? (
                                      <HeartFilled
                                        style={{ color: "#ff4d4f" }}
                                      />
                                    ) : (
                                      <HeartOutlined />
                                    )
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(image.id);
                                  }}
                                />
                                <Button
                                  type="text"
                                  icon={<ShareAltOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(image);
                                  }}
                                />
                                <Button
                                  type="text"
                                  icon={<DownloadOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(image);
                                  }}
                                />
                              </Space>
                            ),
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Tooltip title="Like">
                        <Button
                          type="text"
                          icon={
                            image.liked ? (
                              <HeartFilled style={{ color: "#ff4d4f" }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={() => toggleLike(image.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="Share">
                        <Button
                          type="text"
                          icon={<ShareAltOutlined />}
                          onClick={() => handleShare(image)}
                        />
                      </Tooltip>,
                      <Tooltip title="Download">
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(image)}
                        />
                      </Tooltip>,
                    ]}
                    style={{
                      borderRadius: 12,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 121, 255, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <Card.Meta
                      description={
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <Text
                            ellipsis={{ tooltip: image.prompt }}
                            style={{ fontSize: 14 }}
                          >
                            {image.prompt}
                          </Text>
                          <Space>
                            <Tag color="blue">{image.style}</Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {image.timestamp.toLocaleTimeString()}
                            </Text>
                          </Space>
                        </Space>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Space>
    </div>
  );
};
