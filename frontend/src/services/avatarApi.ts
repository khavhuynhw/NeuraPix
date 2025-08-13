import axios from "axios";
import type { User } from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const USERS_BASE_URL = `${BASE_URL}/api/v1/users`;

export interface AvatarUploadResponse {
  success: boolean;
  data?: User;
  message?: string;
}

class AvatarApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async uploadAvatar(userId: number, file: File): Promise<User> {
    try {
      // Validate file on client side
      this.validateFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${USERS_BASE_URL}/${userId}/avatar`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            // Don't set Content-Type, let browser set it with boundary for multipart/form-data
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              // You can use this for progress indication
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      if (error.response?.data) {
        throw new Error(
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data.message || "Failed to upload avatar"
        );
      }
      throw new Error("Failed to upload avatar");
    }
  }

  private validateFile(file: File): void {
    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed");
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    // Check if it's actually an image by trying to read it
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Create a preview URL for the selected file
   */
  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Clean up preview URL to prevent memory leaks
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Compress image before upload (optional utility)
   */
  async compressImage(
    file: File,
    maxWidth: number = 800,
    maxHeight: number = 800,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob!], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export const avatarApi = new AvatarApiService();