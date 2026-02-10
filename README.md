# 📚 Online Library Platform

A modern, full-featured online library platform built with React, TypeScript, and Supabase. Browse books, manage favorites, read user comments, rate books, and access a secure admin panel.

## 🌟 Features

- **📖 Book Library**: Browse and search thousands of books by category
- **❤️ Favorites**: Save books to your personal favorites list
- **💬 Comments & Discussions**: Read and post comments on books
- **⭐ Rating System**: Rate books and see community ratings
- **👤 User Profiles**: Create accounts and manage your library profile
- **📊 Statistics**: View reading statistics and insights
- **🔐 Secure Admin Panel**: Manage books, users, and content with password-protected admin access
- **🌓 Dark/Light Mode**: Comfortable reading with theme switching
- **🌍 Multi-language Support**: Available in multiple languages
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ (or use `nvm` for version management)
- npm or pnpm package manager
- A Supabase project (free tier available at https://supabase.com)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/abdulaziz-uzb777/library_project.git
cd library_project
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
pnpm install
\`\`\`

### 3. Set Up Environment Variables

Copy the example env file and configure it:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit \`.env.local\` with your Supabase credentials:

\`\`\`
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
\`\`\`

Get these values from your Supabase project:
- Go to https://app.supabase.com
- Select your project
- Click "Settings" → "API"
- Copy the "Project URL" and "anon key"

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will start at \`http://localhost:5173\`

### 5. Access the Site

- **Home**: http://localhost:5173
- **Admin Panel**: http://localhost:5173/admin_abdulaziz787
- Default admin password: \`7777\` (⚠️ Change this immediately!)

## 🔐 Admin Panel Security

The admin panel is protected with:
- Obfuscated URL: `/admin_abdulaziz787/`
- SHA-256 password hashing
- 24-hour session tokens
- Automatic session timeout

**Important**: Change the default admin password immediately in production!

See [ADMIN_SECURITY_GUIDE.md](./ADMIN_SECURITY_GUIDE.md) for complete security instructions.

## 🚀 Deployment to Vercel

### 1. Push to GitHub

\`\`\`bash
git add .
git commit -m "Initial commit: Production-ready online library platform"
git push origin main
\`\`\`

### 2. Connect to Vercel

1. Go to https://vercel.com
2. Click "Import Project"
3. Enter your GitHub repository URL: \`https://github.com/abdulaziz-uzb777/library_project.git\`
4. Click "Continue"

### 3. Configure Environment Variables

In the Vercel dashboard, add your environment variables:

- \`VITE_SUPABASE_URL\` - Your Supabase Project URL
- \`VITE_SUPABASE_ANON_KEY\` - Your Supabase Anonymous Key

### 4. Deploy

Click "Deploy" and wait for the build to complete. Your site will be live in seconds!

Vercel will provide you with:
- Production URL (e.g., https://library-project.vercel.app)
- Preview URLs for each branch
- Automatic deployments on push

### 5. Custom Domain (Optional)

In Vercel dashboard:
1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

## 📊 Project Structure

\`\`\`
library_project/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── app/
│   │   ├── App.tsx           # Main App component
│   │   ├── routes.tsx        # React Router configuration
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React Context providers
│   │   ├── pages/            # Page components
│   │   └── styles/           # CSS files
│   ├── utils/
│   │   ├── api.ts            # API client functions
│   │   └── adminSecurityUtils.ts # Admin security helpers
├── supabase/
│   └── functions/            # Serverless functions
├── public/                   # Static assets
├── vite.config.ts           # Vite configuration
├── vercel.json              # Vercel configuration
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.mjs       # PostCSS config
└── README.md                # This file
\`\`\`

## 🛠️ Available Scripts

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
\`\`\`

## 🔒 Security Features

✅ **Password Protection**: Admin panel requires authentication
✅ **Session Management**: Auto-logout after 24 hours
✅ **Password Hashing**: SHA-256 hashing for password security
✅ **Supabase Auth**: User authentication and authorization
✅ **CORS Protection**: Secure API endpoints
✅ **Environment Variables**: Sensitive data kept private

## 🐛 Troubleshooting

### Build Fails on Vercel

1. Check that all environment variables are set correctly
2. Verify Supabase URL and keys are valid
3. Ensure Node.js version is 18+
4. Check Vercel build logs for specific errors

### Admin Panel Not Loading

1. Verify you're accessing: \`/admin_abdulaziz787/\`
2. Check browser console for errors (F12)
3. Ensure Supabase is running and accessible
4. Clear browser cache and try again

### Books Not Loading

1. Check Supabase connection in browser console
2. Verify API endpoint in \`src/utils/api.ts\`
3. Ensure Supabase has books data
4. Check network tab for API errors

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [Vercel Documentation](https://vercel.com/docs)

## 📄 License

This project is available under the MIT License. See LICENSE file for details.

## 👨‍💻 Author

**Abdulaziz Uzbek**
- GitHub: [@abdulaziz-uzb777](https://github.com/abdulaziz-uzb777)
- Email: [your-email@example.com]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check existing [Issues](https://github.com/abdulaziz-uzb777/library_project/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce the problem
4. Add screenshots if applicable

---

**Last Updated**: February 10, 2026
**Status**: ✅ Production Ready for Vercel Deployment
