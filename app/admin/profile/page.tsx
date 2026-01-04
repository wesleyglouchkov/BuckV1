import UserProfile from "@/components/UserProfile";
import { User } from "lucide-react";

export default function AdminProfilePage() {
  return (
    <div className="container mx-auto px-6 py-6">
     <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                <User className="w-8 h-8 text-primary font-bold " />
                    <h1 className="text-2xl font-bold text-foreground mt-2">Admin Profile</h1>
                </div>
                <p className="text-muted-foreground">Manage creators and members</p>
            </div>
      <UserProfile />
    </div>
  );
}
