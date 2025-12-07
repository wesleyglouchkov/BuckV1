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
    redirect("/explore");
  }


  return <CreatorLayoutClient session={session}>{children}</CreatorLayoutClient>;
}
