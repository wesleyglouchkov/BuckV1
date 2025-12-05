"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Logged in successfully");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
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
            Welcome to Buck
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            Your all-in-one platform for creators and communities. Join thousands of users building something amazing.
          </p>
          <div className="mt-12 flex items-center gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-white/70 text-sm">Active Users</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-white/70 text-sm">Creators</p>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-white/70 text-sm">Content</p>
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

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Sign in
            </h2>
            <p className="mt-2 text-muted-foreground">
              Welcome back! Please enter your details.
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
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center rounded-xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="loader"></span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
