const fs = require('fs');
const path = require('path');

const routesDir = 'c:\\Users\\devad\\OneDrive\\Desktop\\m8\\backend\\routes';
const files = fs.readdirSync(routesDir);

const allRoutes = [];

files.forEach(file => {
    if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
        const lines = content.split('\n');
        lines.forEach(line => {
            const match = line.match(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/i);
            if (match) {
                allRoutes.push({
                    file: file,
                    method: match[1].toUpperCase(),
                    path: match[2],
                    fullPath: `/api/${file.replace('Routes.js', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}${match[2]}`
                });
            }
        });
    }
});

console.log(JSON.stringify(allRoutes, null, 2));
