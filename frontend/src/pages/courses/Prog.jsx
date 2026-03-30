import React from "react";

const ProgrammingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/programing.jpeg"
                        alt="Programming Mastery Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Programming Mastery Course
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Master the art of programming with a comprehensive course covering the most in-demand programming languages and tools. Build robust projects and gain skills for real-world applications.
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
                                <span className="font-bold">C Programming:</span> Understand basic syntax and structure of C programs, work with control structures, functions, and pointers.
                            </p>
                        </div>

                        {/* C++ Programming */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">C++ Programming:</span> Master object-oriented programming concepts, inheritance, polymorphism, and encapsulation.
                            </p>
                        </div>

                        {/* Python */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Python:</span> Learn Python basics, data types, control flow, and work with libraries like NumPy and Pandas for data manipulation.
                            </p>
                        </div>

                        {/* Java */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Java:</span> Understand core Java concepts like OOP, collections, multithreading, and build desktop and web applications.
                            </p>
                        </div>

                        {/* JavaScript */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">JavaScript:</span> Master JavaScript fundamentals, manipulate the DOM, work with ES6+ features and APIs to build interactive web applications.
                            </p>
                        </div>

                        {/* MySQL */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">MySQL:</span> Learn database design, work with SQL queries, and build relational databases for efficient data storage.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Advanced Project Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Advanced-Level Projects
                    </h3>
                    <p className="text-lg text-gray-600 text-center mb-6">
                        Apply your learning to real-world scenarios with over 10 advanced-level projects, including:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Building a dynamic e-commerce platform</li>
                        <li>Creating a content management system (CMS)</li>
                        <li>Developing a personal finance tracker</li>
                        <li>Building RESTful APIs for web applications</li>
                        <li>Creating a data visualization dashboard</li>
                        <li>Automating tasks with Python scripts</li>
                    </ul>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Why This Course?
                    </h3>
                    <ul className="list-disc list-inside text-lg text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Master the most in-demand programming languages and tools</li>
                        <li>Develop a strong foundation for software development careers</li>
                        <li>Hands-on practice with industry-relevant projects</li>
                        <li>Gain expertise to excel in coding interviews and job roles</li>
                    </ul>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12 border-t pt-8">
                    <p className="text-xl font-medium text-gray-800">
                        Duration: <span className="text-gray-600">16 Weeks</span>
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

export default ProgrammingCourseDetail;
