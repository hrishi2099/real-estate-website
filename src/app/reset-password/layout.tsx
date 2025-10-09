import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Zaminseva Prime",
  description: "Reset your Zaminseva Prime account password",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
