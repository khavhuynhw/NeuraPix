import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import viteImagemin from 'vite-plugin-imagemin'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), 
    react(),
    
    // Image optimization
    viteImagemin({
      // JPEG optimization
      mozjpeg: {
        quality: 80,
      },
      // PNG optimization
      pngquant: {
        quality: [0.65, 0.8],
        speed: 4,
      },
      // SVG optimization
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
            active: false,
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
    
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // Only compress files larger than 1KB
      deleteOriginFile: false,
    }),
    
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
  ],
  
  // Build optimizations
  build: {
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for advanced bundling
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-antd': ['antd', '@ant-design/icons'],
          'vendor-utils': ['axios', 'clsx', 'tailwind-merge'],
          'vendor-emotion': ['@emotion/react', '@emotion/styled'],
          'vendor-icons': ['lucide-react'],
          
          // Admin pages chunk (lazy loaded)
          'admin': [
            './src/pages/admin/AdminDashboard.tsx',
            './src/pages/admin/UserManagement.tsx',
            './src/pages/admin/ContentManagement.tsx',
            './src/pages/admin/AdminAnalytics.tsx',
            './src/pages/admin/AdminSettings.tsx',
          ],
        },
        
        // Asset file naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Source maps for debugging (can be disabled in production)
    sourcemap: false,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096, // 4kb
    
    // CSS code splitting
    cssCodeSplit: true,
  },
  
  // Development server optimizations
  server: {
    // Enable compression
    middlewareMode: false,
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      '@ant-design/icons',
      'axios',
      'clsx',
      'tailwind-merge',
      'lucide-react',
    ],
    // Force pre-bundling for better performance
    force: false,
  },
  
  // Asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@services': resolve(__dirname, 'src/services'),
      '@types': resolve(__dirname, 'src/types'),
      '@layouts': resolve(__dirname, 'src/layouts'),
      '@context': resolve(__dirname, 'src/context'),
    },
  },
  
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        // Enable relative imports for better CDN compatibility
        return `./${filename}`;
      }
      return filename;
    },
  },
})
