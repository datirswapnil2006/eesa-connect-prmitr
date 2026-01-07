// src/pages/Terms.tsx
import React from "react";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow border border-slate-200 p-8 space-y-8">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Effective Date: December 2025
          </p>
        </header>

        {/* Intro */}
        <p className="text-sm text-slate-600 leading-relaxed">
          These Terms & Conditions govern your access to and use of the EESA
          website, services, and activities. By using our platform, you agree
          to follow these terms.
        </p>

        {/* Section 1 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            1. Acceptance of Terms
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By accessing or using EESA services, you confirm that you have read,
            understood, and agreed to these Terms. If you do not agree, please
            discontinue use of the platform.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            2. User Responsibilities
          </h2>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            <li>Provide accurate and updated information</li>
            <li>Keep your login details secure</li>
            <li>Use the platform respectfully and legally</li>
            <li>Avoid misuse, abuse, or unauthorized access</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            3. Content Ownership
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All content published on the EESA platform, including text,
            graphics, and materials, belongs to EESA unless stated otherwise.
            Reuse without permission is not allowed.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            4. Membership & Access
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Membership benefits, fees, and access rules are defined by EESA.
            We reserve the right to suspend or terminate access if these Terms
            are violated.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            5. Disclaimer
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            EESA services are provided on an "as available" basis. We do not
            guarantee uninterrupted access or error-free operation.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            6. Governing Law
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            These Terms are governed by the laws of Maharashtra, India. Any
            disputes shall be handled under the jurisdiction of Amravati courts.
          </p>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-slate-200 text-center space-y-2">
          <p className="text-xs text-slate-500">
            For questions, contact us at
          </p>
          <a
            href="eesa.prmitr@gmail.com"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            eesa.prmitr@gmail.com
          </a>
        </footer>

      </div>
    </div>
  );
}
export default Terms;