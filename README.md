# ⚡ React Secure Authentication Template

A secure authentication template built with React, TypeScript, and SQLite, featuring password hashing and session management.

## 🫏 Features

- User registration and login
- Secure password hashing using scrypt
- Session-based authentication with SQLite store
- TypeScript support with full type safety
- Express.js backend with secure middleware configuration
- Rate limiting and security headers
- Comprehensive error handling and logging
- Modern UI components with Radix UI
- Tailwind CSS for styling
- Vite for fast development and building

## 🪼 Quick Start

Create a new project using this template:

```bash
npx vite-react-ts-full-template yourprojectname
```

This will create a new directory `my-app` with all the template files and dependencies installed.

## 🪸 Manual Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation Steps

1. Create a new project:

   ```bash
   npm vite-react-ts-full-template my-app
   cd my-app
   ```
2. Start the development server:

   ```bash
   npm run db:push
   npm run dev
   ```
3. if Port is already in use:

   ```
   netstat -ano | findstr :5000
   taskkill /PID TASKID /F
   ```

## 🕵️ Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/              # Backend Express application
│   ├── middleware/      # Express middleware
│   ├── routes/         # API routes
│   └── utils/          # Server utilities
└── shared/             # Shared types and utilities
```

## 🔐 Security Features

- CORS protection
- Rate limiting
- Session management
- XSS protection
- CSRF protection
- Secure password hashing
- HTTP security headers
- Input validation

## 🐳 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-secret-key
DOMAIN=localhost
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Update database schema

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
