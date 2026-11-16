"use client";

/**
 * Home-page feature deep link with a login round-trip.
 *
 * - Signed in: goes straight to the real feature page.
 * - Guest: goes to /signin?redirect=<feature>. Both the sign-in and sign-up
 *   pages honor `?redirect=` via postLoginPath(), so after authenticating
 *   (password, sign-up, or Google) the user lands on the feature they wanted.
 *
 * The redirect target is sanitized by signInUrlWithReturn() (same-origin
 * in-app paths only), so this is safe against open redirects.
 */
import Link from "next/link";
import { useAuth } from "../../lib/AuthContext";
import { signInUrlWithReturn } from "../../lib/redirect";

export default function FeatureLink({ feature, className = "", children, ariaLabel }) {
  const { isAuthenticated } = useAuth();
  const href = isAuthenticated ? feature : signInUrlWithReturn(feature);

  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
