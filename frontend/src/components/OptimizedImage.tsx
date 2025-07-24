import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * OptimizedImage component with WebP support, lazy loading, and responsive images
 * Automatically handles fallbacks and performance optimizations
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  style,
  sizes = '100vw',
  priority = false,
  onLoad,
  onError,
  placeholder = 'empty',
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Get image name without extension for building responsive sources
  const getImageBaseName = (imageSrc: string): string => {
    const pathParts = imageSrc.split('/');
    const filename = pathParts[pathParts.length - 1];
    return filename.split('.')[0];
  };

  // Get image directory path
  const getImageDir = (imageSrc: string): string => {
    const pathParts = imageSrc.split('/');
    pathParts.pop(); // Remove filename
    return pathParts.join('/');
  };

  // Build responsive image sources
  const baseName = getImageBaseName(src);
  const imageDir = getImageDir(src);
  const optimizedDir = imageDir.replace('/assets/', '/assets/optimized/');

  // WebP sources with responsive breakpoints
  const webpSrcSet = [
    `${optimizedDir}/${baseName}-sm.webp 640w`,
    `${optimizedDir}/${baseName}-md.webp 768w`,
    `${optimizedDir}/${baseName}-lg.webp 1024w`,
    `${optimizedDir}/${baseName}-xl.webp 1280w`,
    `${optimizedDir}/${baseName}.webp 1920w`,
  ].join(', ');

  // JPEG fallback sources
  const jpegSrcSet = [
    `${optimizedDir}/${baseName}-sm.jpg 640w`,
    `${optimizedDir}/${baseName}-md.jpg 768w`,
    `${optimizedDir}/${baseName}-lg.jpg 1024w`,
    `${optimizedDir}/${baseName}-xl.jpg 1280w`,
    `${optimizedDir}/${baseName}.jpg 1920w`,
  ].join(', ');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters the viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Placeholder styles
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: placeholder === 'blur' ? '#f0f0f0' : 'transparent',
    backgroundImage: blurDataURL && placeholder === 'blur' ? `url(${blurDataURL})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: placeholder === 'blur' ? 'blur(10px)' : undefined,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 0 : 1,
  };

  const imageStyle: React.CSSProperties = {
    ...style,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
  };

  // Error fallback
  if (hasError) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px',
          minHeight: '100px',
        }}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', ...style }} className={className}>
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            ...placeholderStyle,
          }}
        />
      )}

      {/* Main image */}
      {isInView && (
        <picture>
          {/* WebP sources for modern browsers */}
          <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
          
          {/* JPEG fallback for older browsers */}
          <source srcSet={jpegSrcSet} sizes={sizes} type="image/jpeg" />
          
          {/* Default img element */}
          <img
            ref={imgRef}
            src={`${optimizedDir}/${baseName}.jpg`}
            alt={alt}
            style={imageStyle}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
          />
        </picture>
      )}
    </div>
  );
};

// Higher-order component for easy migration from existing img tags
export const withOptimizedImage = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<HTMLElement, P & OptimizedImageProps>((props, ref) => {
    const { src, alt, ...restProps } = props;
    return (
      <Component {...(restProps as P)} ref={ref}>
        <OptimizedImage src={src} alt={alt} />
      </Component>
    );
  });
};

// Utility hook for preloading critical images
export const usePreloadImage = (src: string) => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [src]);
};

export default OptimizedImage;