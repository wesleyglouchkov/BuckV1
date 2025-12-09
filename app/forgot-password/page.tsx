 "use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Lock, ArrowLeft } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Set page title
  useEffect(() => {
    document.title = "Forgot Password | Buck";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      toast.success("Password reset email sent successfully!");
      router.push("/email-sent");
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary to-secondary relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="relative">
            <div className="absolute -inset-8">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 right-0 w-32 h-20 bg-white/15 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] rotate-12"></div>
              <div className="absolute top-8 right-4 w-16 h-16 bg-white/10 rounded-[60%_40%_30%_70%/60%_30%_70%_40%] -rotate-12"></div>
            </div>
            <div className="relative p-8 mb-8">
              <Image
                src="/buck.svg"
                alt="Buck Logo"
                width={120}
                height={120}
                className="drop-shadow-2xl"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-center">
            Reset Password
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            Don't worry, it happens to the best of us. We'll help you get back
            into your account.
          </p>
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="text-white/90">
                <p className="font-semibold mb-1">Secure Reset</p>
                <p className="text-sm text-white/70">
                  We'll send a secure link to your email to reset your password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-primary/10 rounded-2xl p-4">
              <Image
                src="/buck.svg"
                alt="Buck Logo"
                width={60}
                height={60}
                className="dark:hidden"
              />
              <Image
                src="/buck-dark.svg"
                alt="Buck Logo"
                width={60}
                height={60}
                className="hidden dark:block"
              />
            </div>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Forgot password?
            </h2>
            <p className="mt-2 text-muted-foreground">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center"
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <div className="mt-8 flex justify-center items-center">
            <Link
              href="/login"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 cursor-pointer" />
              <span className="mt-1">Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
