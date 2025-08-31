export interface Theme {
  name: string;
  id:
    | 'light'
    | 'dark'
    | 'ocean'
    | 'forest'
    | 'contrast'
    | 'pastel-blue'
    | 'pastel-pink'
    | 'pastel-purple'
    | 'pastel-orange'
    | 'pastel-mint'
    | 'pastel-yellow';
  swatch: string; // preview color
}

export const themes: Theme[] = [
  { name: 'Light', id: 'light', swatch: '#0969da' },
  { name: 'Dark', id: 'dark', swatch: '#1f6feb' },
  { name: 'Ocean', id: 'ocean', swatch: '#06b6d4' },
  { name: 'Forest', id: 'forest', swatch: '#16a34a' },
  { name: 'High Contrast', id: 'contrast', swatch: '#58a6ff' },
  { name: 'Pastel Blue', id: 'pastel-blue', swatch: '#93c5fd' },
  { name: 'Pastel Pink', id: 'pastel-pink', swatch: '#f9a8d4' },
  { name: 'Pastel Purple', id: 'pastel-purple', swatch: '#c4b5fd' },
  { name: 'Pastel Orange', id: 'pastel-orange', swatch: '#fdba74' },
  { name: 'Pastel Mint', id: 'pastel-mint', swatch: '#a7f3d0' },
  { name: 'Pastel Yellow', id: 'pastel-yellow', swatch: '#fde68a' },
];
