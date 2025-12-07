import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">My Profile</h1>
            <div className="bg-card p-6 rounded-lg shadow-sm border">
                <p className="text-foreground">Welcome, {session.user?.name || session.user?.email}</p>
                <p className="text-muted-foreground mt-2">Role: {session.user?.role}</p>
            </div>
        </div>
    );
}
