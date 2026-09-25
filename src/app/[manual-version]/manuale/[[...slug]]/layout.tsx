export default function ManualLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">{children}</div>;
}
