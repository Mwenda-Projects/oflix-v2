# OfliX

OfliX is a modern web app for creating and managing business-facing digital experiences. It combines onboarding, account management, marketing pages, and personalized business microsites into a single platform.

## Overview

The app is built with React, TypeScript, Vite, and Tailwind CSS. It supports public business pages, protected dashboard flows, authentication, and a flexible design system for users to launch branded online presences quickly.

## Features

- User authentication and guest/protected routing
- Guided onboarding flow for new users
- Dashboard for managing a business profile and website
- Public business landing pages under a custom slug
- Theme and language support
- Settings and account management
- Upgrade/payment-related experience
- Vercel-friendly SPA deployment with rewrite rules
- Serverless API utilities for background tasks and integrations

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Supabase
- Resend
- PDFKit
- Lucide React

## Project Structure

```text
oflix-v2/
├── api/                  # Serverless API utilities and background jobs
├── public/               # Static assets
├── src/                  # Application source code
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── pages/            # Route-level pages
│   └── ...               # App logic, hooks, types, and utilities
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
└── README.md
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Preview the production build:

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev      # Run the Vite development server
npm run build    # Type-check and build the production bundle
npm run preview  # Preview the built app locally
npm run lint     # Run ESLint checks
```

## Environment Variables

Create a `.env` file in the project root and add any required runtime variables for the services used by the app, such as:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The exact values depend on your Supabase and deployment setup. If your project uses additional service credentials, configure them in the same way.

## Deployment

This project is configured for deployment on Vercel. The included `vercel.json` defines SPA rewrites so client-side routes resolve correctly in production.

Typical deployment flow:

1. Push the repository to GitHub
2. Import the project into Vercel
3. Configure environment variables
4. Deploy the app

## Notes

The app includes special handling for business subdomains such as `businessname.oflix.space`, with routing logic that renders a business-specific microsite when the hostname matches the configured apex domain.

## License

This project does not currently declare a license in the repository metadata. If you are using or distributing the code, confirm the licensing status with the repository owner before publication or commercial use.
