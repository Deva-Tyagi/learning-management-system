const fs = require('fs');
const path = require('path');

const routesDir = 'c:\\Users\\devad\\OneDrive\\Desktop\\m8\\backend\\routes';
const files = fs.readdirSync(routesDir);

let markdown = '# 🚨 Master API Reference (100% Comprehensive)\n\n';
markdown += '| File | Method | Endpoint | Description (Inferred) |\n| :--- | :--- | :--- | :--- |\n';

files.forEach(file => {
    if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
        const lines = content.split('\n');
        const baseRoute = `/api/${file.replace('Routes.js', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
        
        lines.forEach(line => {
            const match = line.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/i);
            if (match) {
                const method = match[1].toUpperCase();
                const subPath = match[2];
                const fullPath = subPath === '/' ? baseRoute : `${baseRoute}${subPath}`;
                
                // Try to find a comment above the route
                let description = 'No description';
                const lineIndex = lines.indexOf(line);
                if (lineIndex > 0) {
                    const prevLine = lines[lineIndex - 1].trim();
                    if (prevLine.startsWith('//')) {
                        description = prevLine.replace('//', '').trim();
                    }
                }
                
                markdown += `| \`${file}\` | **${method}** | \`${fullPath}\` | ${description} |\n`;
            }
        });
    }
});

fs.writeFileSync('c:\\Users\\devad\\OneDrive\\Desktop\\m8\\master_api_list.md', markdown);
console.log('Master API list generated at master_api_list.md');
