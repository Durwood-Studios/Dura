export default function AppLayout({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div className="min-h-screen bg-[#FAFAFA] text-neutral-900">{children}</div>;
}
