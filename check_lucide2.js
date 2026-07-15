import * as lucide from 'lucide-react';
const names = ['Plus', 'Edit2', 'Trash2', 'Check', 'X', 'GripVertical', 'Image', 'Loader2'];
for (const name of names) {
  if (!lucide[name]) console.log('Missing:', name);
}
console.log('Done');
