import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminNavbar } from "@/components/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // if (session.user?.role !== "admin") {
  //   redirect("/explore");
  // }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavbar session={session} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
