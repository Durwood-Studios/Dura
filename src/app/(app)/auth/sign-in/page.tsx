import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to DURA to sync your learning progress across devices.",
};

export default function SignInPage(): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <SignInForm />
    </div>
  );
}
