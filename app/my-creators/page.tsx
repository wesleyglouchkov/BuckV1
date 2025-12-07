import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function MyCreatorsPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">My Creators</h1>
            <div className="grid gap-4">
                <p className="text-muted-foreground">List of creators you follow will appear here.</p>
            </div>
        </div>
    );
}
