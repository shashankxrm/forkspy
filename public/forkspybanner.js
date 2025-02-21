import sharp from 'sharp';

// Create a 1200x300 banner
const width = 1200;
const height = 300;

// Create SVG content
const svgContent = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d2d2d;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#grad)"/>
  
  <!-- Grid Pattern -->
  <path d="M30 0 L30 300 M60 0 L60 300 M90 0 L90 300" 
        stroke="#333" stroke-width="0.5" opacity="0.3"/>
  <path d="M0 30 L1200 30 M0 60 L1200 60 M0 90 L1200 90" 
        stroke="#333" stroke-width="0.5" opacity="0.3"/>
  
  <!-- Fork Icon -->
  <g transform="translate(250, 90) scale(1.2)" fill="none" stroke="#64B5F6" stroke-width="8" filter="url(#glow)">
    <path d="M50,0 L50,100 M50,50 L100,50 L100,100 M0,50 L50,50" 
          stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="0" r="10"/>
    <circle cx="100" cy="100" r="10"/>
    <circle cx="0" cy="50" r="10"/>
  </g>
  
  <!-- Project Name -->
  <text x="450" y="170" 
        font-family="Arial, sans-serif" 
        font-size="80" 
        font-weight="bold" 
        fill="#ffffff"
        filter="url(#glow)">
    Fork<tspan fill="#64B5F6">Spy</tspan>
  </text>
  
  <!-- Tagline -->
  <text x="450" y="210" 
        font-family="Arial, sans-serif" 
        font-size="20" 
        fill="#999999">
    Monitor and analyze GitHub repository forks with ease
  </text>
  
  <!-- Decorative Elements -->
  <circle cx="1100" cy="50" r="20" fill="#64B5F6" opacity="0.5"/>
  <circle cx="1130" cy="80" r="15" fill="#64B5F6" opacity="0.3"/>
  <circle cx="1070" cy="70" r="10" fill="#64B5F6" opacity="0.2"/>
</svg>
`;

// Generate the banner
await sharp(Buffer.from(svgContent))
  .toFormat('png')
  .toFile('forkspy-banner.png');

console.log('Banner generated successfully as forkspy-banner.png');