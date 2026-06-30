import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Request a password reset link for your DURA account.",
};

export default function ForgotPasswordPage(): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <ForgotPasswordForm />
    </div>
  );
}
