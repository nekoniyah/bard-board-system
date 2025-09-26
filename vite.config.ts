import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// config vite simple
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 5173,
    strictPort: false,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip'
          ]
        }
      }
    },
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },

  optimizeDeps: {
    exclude: ['@vite/client', '@vite/env'],
    include: [
      'react',
      'react-dom',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ]
  },
});