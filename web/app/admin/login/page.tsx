import type { Metadata } from "next";
import "@/styles/admin.css";
import { BodyClass } from "@/components/site/body-class";
import { SiteEngine } from "@/components/site/site-engine";

export const metadata: Metadata = {
  title: "Sign in | Template Marketplace Admin",
  robots: { index: false, follow: false },
};

/**
 * Port of site/admin/login.html. The card is real markup — the only server-rendered admin page —
 * and `login.js` takes over the form: it skips the card for a live session and posts the password.
 */
export default function AdminLoginPage() {
  return (
    <>
      <BodyClass name="admin-page" />
      <main className="login-shell">
        <div className="login-card">
          <a className="login-brand" href="/index.html" aria-label="Template Marketplace home">
            <img src="/assets/img/litho-wordmark.png?v=20261007-01" alt="" width={656} height={192} />
            <span>TEMPLATE MARKETPLACE</span>
          </a>
          <h1>Admin sign in</h1>
          <p className="lead">Protected dashboard — templates, submissions, taxonomy and the generated registry.</p>
          <form id="login-form" noValidate>
            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="username">Admin username</label>
              <input type="text" id="username" name="username" autoComplete="username" required />
              <span className="field-error" data-error-for="username" />
            </div>
            <div className="field" style={{ marginBottom: 14 }}>
              <label htmlFor="password">Admin password</label>
              <input type="password" id="password" name="password" autoComplete="current-password" required />
              <span className="field-error" data-error-for="password" />
            </div>
            <button className="btn primary" type="submit" style={{ width: "100%", justifyContent: "center" }}>
              Sign in →
            </button>
            <p id="login-message" className="field-hint" style={{ marginTop: 14, minHeight: 16 }} />
          </form>
        </div>
      </main>
      <SiteEngine engine="adminLogin" />
    </>
  );
}
