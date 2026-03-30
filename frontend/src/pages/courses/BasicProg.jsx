import React from "react";

const BasicProgrammingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="https://via.placeholder.com/1200x400?text=Basic+Programming+Course"
                        alt="Basic Programming Course"
                        className="w-full h-72 md:h-96 object-cover rounded-lg shadow-lg"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Basic Computer Programming Course
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Begin your journey in the world of programming with this foundational course. Learn the basics of programming languages like C, Python, and HTML to kickstart your tech career.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* C Programming */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">C Programming:</span> Learn the basic syntax and structure of C, work with control structures, loops, and arrays, and develop foundational problem-solving skills.
                            </p>
                        </div>

                        {/* Python */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Python:</span> Understand Python basics: syntax, variables, and data types, learn control flow, functions, and basic data structures, and create simple automation scripts and projects.
                            </p>
                        </div>

                        {/* HTML */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">HTML:</span> Learn HTML structure and syntax, create basic web pages with headings, images, and links, and understand forms, tables, and basic styling.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Why This Course?
                    </h3>
                    <ul className="list-disc list-inside text-lg text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Build a strong foundation in programming</li>
                        <li>Gain hands-on experience with popular beginner-friendly languages</li>
                        <li>Prepare for advanced programming courses</li>
                        <li>Learn skills that are applicable across various industries</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16">
                    <p className="text-lg md:text-xl text-gray-600">
                        This course is perfect for students and beginners who want to enter the world of programming and technology. Gain confidence in writing your first programs and creating basic web pages.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12 border-t pt-8">
                    <p className="text-xl font-medium text-gray-800">
                        Duration: <span className="text-gray-600">6 Weeks</span>
                    </p>
                </div>

                {/* Enroll Button */}
                <div className="text-center">
                    <button
                        className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-lg hover:bg-orange-700 transition duration-300"
                    >
                        Enroll Now
                    </button>
                </div>
            </div>
        </section>
    );
};

export default BasicProgrammingCourseDetail;
