import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreatorLayoutClient from "@/components/creator/CreatorLayoutClient";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // if (session.user?.role !== "creator") {
  //   redirect("/explore");
  // }

  return <CreatorLayoutClient session={session}>{children}</CreatorLayoutClient>;
}
