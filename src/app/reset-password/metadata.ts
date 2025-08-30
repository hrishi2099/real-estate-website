import { generateMetadata as generateMetadataHelper } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generateMetadataHelper(
  "Reset Password",
  "Reset your password to regain access to your account. Enter your new password to continue.",
  null,
  {
    canonical: "/reset-password"
  }
);
