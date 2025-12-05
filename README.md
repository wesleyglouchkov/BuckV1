# Buck V1

A modern Next.js application with role-based authentication and a beautiful UI.

## Features

- ✅ Next.js 15 with App Router
- ✅ Tailwind CSS v4
- ✅ TypeScript
- ✅ Auth.js (NextAuth v5) for authentication
- ✅ Role-based access control (Admin, Creator, Member)
- ✅ Beautiful theming with TweakCN
- ✅ Toast notifications with Sonner
- ✅ Responsive design

## Roles

- **Admin**: Access to `/admin/dashboard`
- **Creator**: Access to `/creator/dashboard`
- **Member**: Access to `/explore`

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
JWT_SECRET=random-secret-340d22
NEXTAUTH_SECRET=random-secret-340d22
NEXTAUTH_URL=http://localhost:3000
```

## Routes

- `/login` - Login page
- `/signup` - Signup page
- `/forgot-password` - Password reset request page
- `/email-sent` - Email sent confirmation page
- `/admin/dashboard` - Admin dashboard (admin only)
- `/creator/dashboard` - Creator dashboard (creator only)
- `/explore` - Explore page (members)

## Backend Integration

The frontend is ready for backend integration. Update the following placeholder API calls:

1. **Authentication** - `auth.ts`: Update the `authorize` function
2. **Signup** - `app/api/auth/signup/route.ts`: Connect to your backend signup endpoint
3. **Forgot Password** - `app/api/auth/forgot-password/route.ts`: Connect to your backend password reset endpoint

## License

MIT
