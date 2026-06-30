import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Set a new password for your DURA account.",
};

export default function ResetPasswordPage(): React.ReactElement {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <ResetPasswordForm />
    </div>
  );
}
