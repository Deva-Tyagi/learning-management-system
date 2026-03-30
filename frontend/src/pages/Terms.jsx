import React from "react";
import { usePlatform } from "../context/PlatformContext";

const TermsOfService = () => {
    const { platformName, supportEmail } = usePlatform();
    return (
        <section className="py-12 px-6 mt-16 flex justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
                    Terms of Service
                </h1>
                <p className="text-base text-gray-700 mb-4">
                    <strong>Last Updated:</strong> 12 January 2025
                </p>

                <p className="text-base text-gray-700 mb-6">
                    Welcome to the {platformName} website. By using our
                    website or services, you agree to comply with and be bound by the following
                    Terms of Service. If you do not agree with these terms, please refrain from
                    using our services.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    1. Use of the Website
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    You agree to use the website only for lawful purposes. You may not use the
                    website in any way that could damage, disable, overburden, or impair its
                    functionality or interfere with any other party’s use of the website.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    2. User Accounts
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    To access certain features, you may be required to create an account. You agree
                    to provide accurate and complete information during the registration process and
                    to keep your account credentials secure. You are responsible for all activities
                    conducted under your account.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    3. Intellectual Property
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    All content on this website, including text, graphics, logos, and software, is
                    the property of {platformName} or its licensors and is protected by applicable copyright,
                    trademark, and other intellectual property laws. You may not reproduce,
                    distribute, or create derivative works from any content without explicit
                    permission.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    4. Payment and Refund Policy
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    Payments for courses or services offered by {platformName} are non-refundable unless
                    otherwise stated. In case of disputes, please contact us at{" "}
                    <a href={`mailto:${supportEmail}`} className="text-blue-500 underline">
                        {supportEmail}
                    </a>.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    5. Limitation of Liability
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    {platformName} is not liable for any direct, indirect, incidental, or consequential
                    damages arising from your use of our website or services. This includes, but is
                    not limited to, loss of data, profits, or business opportunities.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    6. Third-Party Links
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    Our website may contain links to third-party websites. These links are provided
                    for your convenience, and we do not endorse or assume responsibility for the
                    content, policies, or practices of these external websites.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    7. Termination
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    We reserve the right to suspend or terminate your access to our website or
                    services at our sole discretion, without prior notice, if we determine that you
                    have violated these Terms of Service.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    8. Changes to the Terms
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    We may update these Terms of Service from time to time. Any changes will be
                    posted on this page with a revised “Last Updated” date. Continued use of our
                    services after such updates constitutes your acceptance of the revised terms.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    9. Governing Law
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    These terms are governed by and construed in accordance with the laws of India. Any disputes will be resolved exclusively in the courts of India.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    10. Contact Us
                </h2>
                <p className="text-base text-gray-700 mb-6">
                    If you have any questions about these Terms of Service, contact us at:
                </p>
                <ul className="pl-6 list-none text-base text-gray-700">
                    <li>
                        <strong>Email:</strong> {supportEmail}
                    </li>
                </ul>
            </div>
        </section>
    );
};

export default TermsOfService;
