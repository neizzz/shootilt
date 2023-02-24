import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
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
      // __IMAGE_ASSET_DIR__: '"/assets/images"',
      // __FONT_ASSET_DIR__: '"/assets/fonts"',
      __SCORE_FONT_NAME__: '"Gamer"',
      AssetKey: {
        __PLAYER_AVOIDER_BUNDLE__: 'asset-key/player-avoider-bundle',
        __PLAYER_BULLET_BUNDLE__: 'asset-key/player-bullet-bundle',
        __TRACKER_BUNDLE__: 'asset-key/tracker-bundle',
      },
    },
    plugins: [react(), tsconfigPaths(), basicSsl()],
  };
});

