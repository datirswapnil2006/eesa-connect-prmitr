// src/pages/Privacy.tsx
import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow border border-slate-200 p-8 space-y-8">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: December 19, 2025
          </p>
        </header>

        {/* Intro */}
        <p className="text-slate-600 text-sm leading-relaxed">
          At EESA, your privacy is important to us. This Privacy Policy explains
          what information we collect, how we use it, and how we protect it.
        </p>

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            1. Information We Collect
          </h2>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Personal details such as name, email, and phone number</li>
            <li>Membership and event participation data</li>
            <li>Payment information handled by trusted third parties</li>
            <li>Technical data like IP address and browser type</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>To manage memberships and services</li>
            <li>To communicate updates and announcements</li>
            <li>To process payments and registrations</li>
            <li>To improve platform security and performance</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            3. Information Sharing
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We do not sell your personal data. Information may be shared only
            with service providers, event partners, or when legally required.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            4. Data Security
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We use standard security measures to protect your data. However,
            no online system can be completely secure.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            5. Your Rights
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You may request access, correction, or deletion of your personal
            information by contacting us.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            EESA © {new Date().getFullYear()} • All rights reserved
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Privacy;