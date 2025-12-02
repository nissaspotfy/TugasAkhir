# Frontend - React + TailwindCSS + shadcn/ui + Zustand + Zod

Setup lengkap untuk aplikasi React modern dengan styling, state management, dan validasi.

## Tech Stack

- **React** - UI Framework
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable components built with Radix UI and Tailwind
- **Zustand** - State management
- **Zod** - TypeScript-first schema validation

## Struktur Folder

```
src/
├── components/
│   └── ui/              # shadcn/ui components
│       ├── button.jsx
│       ├── input.jsx
│       └── card.jsx
├── lib/
│   └── utils.js         # Utility functions (cn)
├── schemas/             # Zod validation schemas
│   ├── authSchema.js
│   └── profileSchema.js
├── stores/              # Zustand stores
│   ├── authStore.js
│   └── uiStore.js
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Usage Examples

### Zustand Store

```javascript
import useAuthStore from '@/stores/authStore'

function Component() {
  const { user, login, logout } = useAuthStore()
  
  // Use store state and actions
}
```

### Zod Validation

```javascript
import { loginSchema } from '@/schemas/authSchema'

try {
  loginSchema.parse(formData)
  // Data is valid
} catch (error) {
  // Handle validation errors
}
```

### shadcn/ui Components

```javascript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function Form() {
  return (
    <>
      <Input placeholder="Email" />
      <Button>Submit</Button>
    </>
  )
}
```

## Adding More Components

Untuk menambahkan komponen shadcn/ui lainnya, kunjungi:
https://ui.shadcn.com/docs/components

## Features

- ✅ TailwindCSS dengan konfigurasi tema lengkap
- ✅ Dark mode support
- ✅ shadcn/ui components (Button, Input, Card)
- ✅ Zustand state management dengan persist dan devtools
- ✅ Zod validation schemas untuk auth dan profile
- ✅ Path aliases (@/components, @/lib, dll)
- ✅ Demo login form dengan validasi

