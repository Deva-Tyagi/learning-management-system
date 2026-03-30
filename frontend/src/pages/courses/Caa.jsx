import React from "react";
import { CheckCircle } from 'lucide-react';

const CourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/caa.jpeg"
                        alt="CAA Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title and Duration */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-6">
                        Certification in Computer Applications (CCA)
                    </h2>
                    <p className="text-xl text-gray-600 mb-4">
                        <span className="font-semibold">Duration:</span> 6 Weeks
                    </p>
                </div>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Master the essential skills for modern workplaces with a focus on computer applications,
                    programming, design, and more. This program is your stepping stone to a tech-savvy future.
                </p>

                {/* What You Will Learn Section */}
                <div className="mb-16">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center">What You Will Learn:</h3>
                    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
                        <ul className="space-y-4">
                            {[
                                "Snap Fundamentals: Understand how computers work, explore hardware components, and learn about software applications.",
                                "MS Word: Create professional documents with formatting, tables, templates, and advanced features.",
                                "MS Excel: Analyze data with formulas, charts, pivot tables, and advanced Excel tools.",
                                "MS PowerPoint: Design captivating presentations with multimedia, animations, and professional templates.",
                                "English Typing: Improve typing speed and accuracy, aiming for 35+ WPM, with guided exercises.",
                                "Hindi Typing: Build confidence in Hindi typing with a focus on achieving 25+ WPM.",
                                "Corel Draw: Dive into graphic design, creating stunning visuals and layouts using Corel Draw tools.",
                                "Photoshop: Learn to edit, enhance, and create professional-quality images with Adobe Photoshop.",
                                "HTML: Get started with web development, mastering the structure and basics of web pages.",
                                "C Programming: Build a strong foundation in programming concepts with hands-on coding in C.",
                                "Python: Explore Python programming, from basics to applications in data analysis and software.",
                                "CTP (Computer Technology Program): Delve into the essentials of computer hardware, networking, and technology."
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start text-base md:text-lg text-gray-700">
                                    <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        This comprehensive course is ideal for students, professionals, and beginners looking to build expertise in computer applications, programming, and graphic design.
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

export default CourseDetail;
