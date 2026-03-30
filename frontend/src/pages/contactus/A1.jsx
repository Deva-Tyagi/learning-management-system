import React from "react";

const ContactHero = () => {
    return (
        <section className="bg-gray-50 py-16 px-8 sm:py-12 sm:px-6 xs:py-8 xs:px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="md:w-1/2">
                    <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 inline-block">
                        Get in Touch
                    </h2>
                    <div className="h-1.5 w-32 bg-gradient-to-r from-blue-600 to-purple-600 mt-6 rounded-full animate-pulse"></div>
                </div>
                
                <div className="md:w-1/2">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        We’re here to help you on your learning journey.
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Reach out to us for any inquiries or support, and our team will respond promptly. Whether you need help with course selection or have a technical question, we're just a message away!
                    </p>
                </div>
            </div>
        </section>
    );
};

export default ContactHero;
