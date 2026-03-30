import React from "react";
import { CheckCircle } from "lucide-react";

const TypingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/typing.jpeg"
                        alt="Typing Skills Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title and Top Information */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
                        Master Typing Skills
                    </h2>
                    <p className="text-xl text-gray-600 mb-4">
                        <span className="font-semibold">Duration:</span> 4 Weeks
                    </p>
                </div>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Unlock your typing potential with this comprehensive course. Learn to type faster and more accurately in both English and Hindi, meeting professional standards and boosting your career opportunities.
                </p>

                {/* What You Will Learn Section */}
                <div className="mb-16">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                        <ul className="space-y-4">
                            <li className="flex items-start text-base md:text-lg text-gray-700">
                                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                                <span>English Typing: Achieve 35+ WPM with guided exercises, error reduction techniques, and professional formatting tips.</span>
                            </li>
                            <li className="flex items-start text-base md:text-lg text-gray-700">
                                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                                <span>Hindi Typing: Build fluency and speed, aiming for 25+ WPM using popular keyboard layouts.</span>
                            </li>
                            <li className="flex items-start text-base md:text-lg text-gray-700">
                                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                                <span>Typing Accuracy: Enhance accuracy and reduce errors with advanced typing exercises and tips.</span>
                            </li>
                            <li className="flex items-start text-base md:text-lg text-gray-700">
                                <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                                <span>Shortcut Mastery: Learn keyboard shortcuts to improve efficiency for office and daily tasks.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        This course is perfect for students, job seekers, and professionals aiming to improve typing skills for personal or professional growth.
                    </p>
                </div>

                {/* Enroll Button */}
                <div className="text-center mb-12">
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

export default TypingCourseDetail;
