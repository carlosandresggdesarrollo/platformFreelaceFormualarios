const fs = require('fs');
const path = require('path');

// Función para procesar un archivo
function fixGridProps(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Patrón 1: Grid con xs, sm, md
  const pattern1 = /<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}\s+md=\{(\d+)\}/g;
  if (pattern1.test(content)) {
    content = content.replace(pattern1, '<Grid size={{ xs: $1, sm: $2, md: $3 }}');
    modified = true;
  }

  // Patrón 2: Grid con xs, sm
  const pattern2 = /<Grid\s+item\s+xs=\{(\d+)\}\s+sm=\{(\d+)\}/g;
  if (pattern2.test(content)) {
    content = content.replace(pattern2, '<Grid size={{ xs: $1, sm: $2 }}');
    modified = true;
  }

  // Patrón 3: Grid con xs, md
  const pattern3 = /<Grid\s+item\s+xs=\{(\d+)\}\s+md=\{(\d+)\}/g;
  if (pattern3.test(content)) {
    content = content.replace(pattern3, '<Grid size={{ xs: $1, md: $2 }}');
    modified = true;
  }

  // Patrón 4: Grid solo con xs
  const pattern4 = /<Grid\s+item\s+xs=\{(\d+)\}/g;
  if (pattern4.test(content)) {
    content = content.replace(pattern4, '<Grid size={{ xs: $1 }}');
    modified = true;
  }

  // Guardar el archivo si fue modificado
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corregido: ${filePath}`);
    return true;
  }
  
  return false;
}

// Función recursiva para buscar archivos .tsx
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let totalFixed = 0;

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorar node_modules y otras carpetas
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        totalFixed += processDirectory(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      if (fixGridProps(filePath)) {
        totalFixed++;
      }
    }
  });

  return totalFixed;
}

// Ejecutar el script
const srcPath = path.join(__dirname, '..', '..', 'src');
console.log('🔧 Iniciando corrección de Grid props...\n');

const fixed = processDirectory(srcPath);

console.log(`\n✨ Proceso completado: ${fixed} archivos corregidos`);
