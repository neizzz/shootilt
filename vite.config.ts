import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  console.log(`vite's mode:`, mode);

  const isProduction = mode === 'production';

  return {
    build: {
      minify: isProduction ? true : false,
    },
    define: {
      // __ASSET_DIR__: mode === 'production' ? '"assets"' : '"assets"',
      __ASSET_DIR__: '"/assets/images"',
    },
    plugins: [tsconfigPaths(), basicSsl()],
  };
});

