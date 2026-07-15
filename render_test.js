import React from 'react';
import { renderToString } from 'react-dom/server';
import HeroSlidesManage from './src/pages/admin/HeroSlidesManage.tsx';

try {
  console.log('Rendering...');
  // Note: Since this is TypeScript/JSX, we can't run it directly with Node.
  // We need tsx or similar.
} catch (e) {
  console.error(e);
}
