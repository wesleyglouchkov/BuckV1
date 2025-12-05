import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "creator") {
    redirect("/explore");
  }

  return <>{children}</>;
}
