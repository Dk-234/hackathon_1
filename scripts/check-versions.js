const path = require('path');
const fs = require('fs');

// Read package.json files
const rootPackageJson = require('../package.json');
const frontendPackageJson = require('../frontend/package.json');

console.log('=== Root dependencies ===');
console.log('React version:', rootPackageJson.dependencies?.react || 'Not found');
console.log('React DOM version:', rootPackageJson.dependencies?.['react-dom'] || 'Not found');
console.log('React Bootstrap version:', rootPackageJson.dependencies?.['react-bootstrap'] || 'Not found');
console.log('Bootstrap version:', rootPackageJson.dependencies?.bootstrap || 'Not found');

console.log('\n=== Frontend dependencies ===');
console.log('React version:', frontendPackageJson.dependencies?.react || 'Not found');
console.log('React DOM version:', frontendPackageJson.dependencies?.['react-dom'] || 'Not found');
console.log('React Bootstrap version:', frontendPackageJson.dependencies?.['react-bootstrap'] || 'Not found');
console.log('Bootstrap version:', frontendPackageJson.dependencies?.bootstrap || 'Not found');
