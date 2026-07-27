const fs = require('fs');
const path = require('path');

const manifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');

if (fs.existsSync(manifestPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let modified = false;

    if (!Array.isArray(data.dataRoutes)) {
      data.dataRoutes = [];
      modified = true;
    }
    if (!Array.isArray(data.staticRoutes)) {
      data.staticRoutes = [];
      modified = true;
    }
    if (!Array.isArray(data.dynamicRoutes)) {
      data.dynamicRoutes = [];
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2));
      console.log('✓ Successfully patched .next/routes-manifest.json (added dataRoutes/staticRoutes/dynamicRoutes).');
    }
  } catch (err) {
    console.error('Failed to patch routes-manifest.json:', err);
  }
} else {
  console.warn('.next/routes-manifest.json not found. Run npm run build first.');
}
