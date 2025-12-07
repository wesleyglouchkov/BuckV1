import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "admin" | "creator" | "member";
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    role: "admin" | "creator" | "member";
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "creator" | "member";
    accessToken?: string;
  }
}
