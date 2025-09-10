const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const outDir = 'dist';

async function build() {
  console.log('Starting frontend build...');

  // Clean previous build
  try {
    await fs.emptyDir(outDir);
    console.log(`Cleaned ${outDir} directory.`);
  } catch (e) {
    console.error(`Error cleaning ${outDir}:`, e);
    process.exit(1);
  }

  // Copy index.html to dist
  try {
    await fs.copy('index.html', path.join(outDir, 'index.html'));
    console.log(`Copied index.html to ${outDir}.`);
  } catch (e) {
    console.error('Error copying index.html:', e);
    process.exit(1);
  }

  // Modify the copied index.html to point to index.js
  try {
    const indexPath = path.join(outDir, 'index.html');
    let htmlContent = await fs.readFile(indexPath, 'utf8');
    htmlContent = htmlContent.replace(
      '<script type="module" src="/index.tsx"></script>',
      '<script type="module" src="/index.js"></script>'
    );
    await fs.writeFile(indexPath, htmlContent, 'utf8');
    console.log(`Updated script path in ${indexPath} to /index.js.`);
  } catch (e) {
    console.error('Error updating script path in dist/index.html:', e);
    process.exit(1);
  }

  // Build index.tsx
  try {
    const result = await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: path.join(outDir, 'index.js'),
      minify: true,
      sourcemap: 'external', 
      platform: 'browser',
      format: 'esm',
      jsx: 'automatic',
      loader: {
        '.tsx': 'tsx',
        '.ts': 'ts',
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
        'process.env.REACT_APP_BACKEND_API_URL': JSON.stringify('/api'), // For Firebase Hosting rewrites or local proxy
        // API_KEY should not be exposed to the frontend bundle.
        // The frontend service (geminiService.ts) should call the backend,
        // and the backend should use its own environment variable for the API key.
        // 'process.env.API_KEY': JSON.stringify(process.env.API_KEY || null), // REMOVED FOR SECURITY
      },
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'lucide-react',
        // '@google/genai' is bundled within geminiService.ts if not made external, or handled by import maps
        'react-router-dom'
        // Note: firebase-functions, cors, express are backend, no need to be external for frontend
      ],
    });

    if (result.errors.length > 0) {
      console.error('Frontend build failed with errors:', result.errors);
      process.exit(1);
    }
    if (result.warnings.length > 0) {
      console.warn('Frontend build has warnings:', result.warnings);
    }

    console.log('Frontend build successful!');
    console.log(`Output directory: ${path.resolve(outDir)}`);

  } catch (e) {
    console.error('Frontend build failed:', e);
    process.exit(1);
  }
}

build();