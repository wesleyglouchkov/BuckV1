import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

// add meta data of title as Admin
export const metadata = {
  title: "Admin | Buck",
};

export default async function AdminLayout({ children}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/explore");
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
