import Link from "next/link";
import Image from "next/image";
import { Mail, Info } from "lucide-react";
import { Button } from "@/components/ui";

export default function EmailSentPage() {
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
            Check Your Inbox
          </h1>
          <p className="text-white/80 text-lg text-center max-w-md">
            We've sent you an email with instructions to reset your password.
          </p>

          {/* Email illustration */}
          <div className="mt-12 relative">
            <div className="w-32 h-24 bg-white/20 rounded-lg transform rotate-3 absolute -right-4 -top-2"></div>
            <div className="w-32 h-24 bg-white/30 rounded-lg transform -rotate-3 relative flex items-center justify-center">
              <Mail className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md text-center">
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

          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-3">
            Check your email
          </h2>
          <p className="text-muted-foreground mb-8">
            We've sent a password reset link to your email address. Please check
            your inbox and follow the instructions.
          </p>

          <div className="bg-card border border-border rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  Didn't receive the email?
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your spam folder or{" "}
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline font-medium"
                  >
                    request a new link
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <Button className="flex items-center justify-center w-full mx-auto">
            Back to Login
          </Button>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Email typically arrives within 1-2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
