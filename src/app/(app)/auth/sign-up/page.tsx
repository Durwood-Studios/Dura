import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a free DURA account to sync your learning progress across devices.",
};

export default function SignUpPage(): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <SignUpForm />
    </div>
  );
}
