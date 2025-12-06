"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SignOutDialogProps {
  children?: React.ReactNode;
  className?: string;
}

export default function SignOutDialog({ children, className }: SignOutDialogProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const defaultTrigger = (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-accent/50 transition-colors ${className || ""}`}
    >
      <LogOut className="w-4 h-4" />
      <p>Sign Out</p>
    </button>
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger className="cursor-pointer" asChild>
        {children || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? You will need to sign in again to access your dashboard.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
