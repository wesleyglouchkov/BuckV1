import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreatorNavbar } from "@/components/creator";

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

  return (
    <div className="flex min-h-screen bg-background">
      <CreatorNavbar session={session} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
