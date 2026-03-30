import React from "react";
import { CheckCircle } from "lucide-react";

const WebDevelopmentCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/web.jpeg"
                        alt="Web Development Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Web Development Mastery
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Become a professional web developer by mastering HTML, CSS, JavaScript, and web hosting. Build advanced-level projects and gain industry-relevant skills to kickstart your career.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">HTML:</span> Structure web pages using semantic HTML5, create forms, tables, multimedia elements, and build responsive layouts with Bootstrap.
                            </p>
                        </div>

                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">CSS:</span> Design stunning layouts with CSS3, master Flexbox and Grid for responsive design, and apply animations and transitions.
                            </p>
                        </div>

                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">JavaScript:</span> Understand core JavaScript concepts, manipulate the DOM, create interactive web pages, and work with ES6+ features and APIs.
                            </p>
                        </div>

                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Web Hosting and Domain Management:</span> Register and manage domains, deploy websites using hosting platforms, and optimize websites for performance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advanced Project Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Advanced-Level Project
                    </h3>
                    <p className="text-lg text-gray-600 text-center mb-6">
                        Apply your skills to build a fully functional web application from scratch. This project will include:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Responsive UI design</li>
                        <li>Interactive features using JavaScript</li>
                        <li>Hosting and domain deployment</li>
                        <li>SEO optimization and performance testing</li>
                    </ul>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Why This Course?
                    </h3>
                    <ul className="list-disc list-inside text-lg text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Learn from scratch with no prior coding experience required.</li>
                        <li>Develop skills in the most in-demand web technologies.</li>
                        <li>Hands-on practice with industry-level projects.</li>
                        <li>Comprehensive coverage of frontend and deployment skills.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        Ideal for aspiring web developers, professionals seeking upskilling, and entrepreneurs aiming to create their own web presence.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-xl font-medium text-gray-800">
                        Duration: <span className="text-gray-600">12 Weeks</span>
                    </p>
                </div>

                {/* Enroll Button */}
                <div className="text-center">
                    <button
                        className="px-10 py-4 bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition duration-300"
                    >
                        Enroll Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default WebDevelopmentCourseDetail;
