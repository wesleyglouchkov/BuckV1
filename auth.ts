import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // This will be replaced with actual backend API call
        // For now, returning mock user data
        if (credentials?.email && credentials?.password) {
          // TODO: Replace with actual API call to backend
          const user = {
            id: "1",
            email: credentials.email as string,
            name: "User",
            role: "member" as "admin" | "creator" | "member",
          };
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "admin" | "creator" | "member";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.JWT_SECRET,
});
