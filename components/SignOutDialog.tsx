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
  onDialogOpen?: () => void;
}

export default function SignOutDialog({ children, className, onDialogOpen }: SignOutDialogProps) {
  const handleSignOut = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      console.log("Signing out...");
      await signOut({ 
        callbackUrl: "/login",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback redirect
      window.location.href = "/login";
    }
  };

  const handleDialogOpen = () => {
    if (onDialogOpen) {
      onDialogOpen();
    }
  };

  const defaultTrigger = (
    <button
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-destructive hover:bg-accent/50 transition-colors ${className || ""}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onDialogOpen) {
          onDialogOpen();
        }
      }}
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
          <button
            onClick={handleSignOut}
            className="inline-flex h-10 items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Sign Out
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
