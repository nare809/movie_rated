
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("Compiling Cloudflare Functions to _worker.js...");

try {
  // Ensure dist exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // Compile using wrangler
  // This command creates a multipart response for some reason in recent wrangler versions
  execSync('npx wrangler pages functions build --outfile dist/_worker.bundle', { stdio: 'inherit' });
  
  if (fs.existsSync('dist/_worker.bundle')) {
      const content = fs.readFileSync('dist/_worker.bundle', 'utf8');
      
      // Check if it's multipart
      if (content.startsWith('------formdata')) {
          console.log("Detected multipart bundle, extracting worker script...");
          const jsStart = content.indexOf('var __defProp');
          const jsEnd = content.lastIndexOf('------formdata');
          
          if (jsStart !== -1 && jsEnd !== -1) {
              const cleanScript = content.substring(jsStart, jsEnd).trim();
              fs.writeFileSync('dist/_worker.js', cleanScript);
              console.log("Success: Clean dist/_worker.js created.");
          } else {
             // Fallback: maybe it's cleaner in newer versions?
             console.log("Could not find start/end of script, saving original.");
             fs.renameSync('dist/_worker.bundle', 'dist/_worker.js');
          }
      } else {
          // Not multipart? Just rename
          fs.renameSync('dist/_worker.bundle', 'dist/_worker.js');
          console.log("Success: dist/_worker.js created (no stripping needed).");
      }
      
      // Cleanup
      if (fs.existsSync('dist/_worker.bundle')) {
        fs.unlinkSync('dist/_worker.bundle');
      }
  } else {
      console.error("Error: Output file not found.");
      process.exit(1);
  }

} catch (error) {
  console.error("Failed to compile functions:", error.message);
  process.exit(1);
}
