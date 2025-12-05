import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  if (role === "admin") {
    redirect("/admin/dashboard");
  } else if (role === "creator") {
    redirect("/creator/dashboard");
  } else {
    redirect("/explore");
  }

  return null;
}
