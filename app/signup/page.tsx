"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import { Check, CheckCircle, Loader } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Debounced username check
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError("Username can only contain letters, numbers, and underscores");
      return;
    }

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      const result = await authService.checkUsername(username);
      if (!result.available) {
        setUsernameError("Username is already taken");
      }
    } catch (error: any) {
      setUsernameError("Unable to check username availability");
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  // Debounce username check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(formData.username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username, checkUsernameAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (usernameError) {
      toast.error("Please fix the username error before submitting");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await authService.signup({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      toast.success("Account created successfully! Please login to continue.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary to-secondary relative overflow-hidden">
        {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div> */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="relative">
            {/* Random organic shapes background */}
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
            Join Buck Today
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            Start your journey with us. Create, share, and connect with a community of passionate individuals.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span>Free to get started</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span>Join the Creator Community</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span>Join our growing community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
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

          <p className="text-center lg:text-left mb-6 text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Create account
            </h2>
            <p className="mt-2 text-muted-foreground">
              Get started with your free account today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                  className={`pr-10 ${
                    usernameError 
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
                      : formData.username.length >= 3 && !isCheckingUsername && !usernameError
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                />
                {/* Loading/Success/Error Icons */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {isCheckingUsername && formData.username.length >= 3 && (
                    <Loader className="w-5 h-5 animate-spin text-gray-400" />
                  )}
                  {!isCheckingUsername && formData.username.length >= 3 && !usernameError && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {usernameError && (
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Error Message */}
              {usernameError && (
                <p className="mt-1 text-sm text-red-600">{usernameError}</p>
              )}
              {/* Success Message */}
              {!usernameError && !isCheckingUsername && formData.username.length >= 3 && (
                <p className="mt-1 text-sm text-green-600">Username is available!</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-border/30 text-primary focus:ring-primary/30"
              />

              <div className="mt-1">
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center"
            >
              {isLoading ? <span className="loader"></span> : "Create account"}
            </Button>
          </form>


        </div>
      </div>
    </div>
  );
}
