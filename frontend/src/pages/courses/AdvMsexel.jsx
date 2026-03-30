import React from "react";

const AdvMsexel = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/3.png"
                        alt="Advanced MS Excel Course"
                        className="w-full h-80 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-6 text-center">
                    Master Advanced MS Excel
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Take your Excel skills to the next level with 70+ advanced topics and
                    hands-on industrial-level exercises designed to enhance your efficiency and data analysis expertise.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">70+ Advanced Topics:</span> Learn advanced formulas & functions, pivot tables & charts, data validation, conditional formatting, macros & VBA, power query & pivot, data modeling & analysis, and more.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Industrial-Level Practice:</span> Work with real-world data sets, create financial models, manage inventory, track sales & forecasts, design dashboards, and generate custom reports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Why This Course?
                    </h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-4 text-base md:text-lg max-w-2xl mx-auto">
                        <li>Master Excel for data-driven decision-making.</li>
                        <li>Develop practical skills applicable in industries.</li>
                        <li>Enhance your career prospects with Excel expertise.</li>
                        <li>Learn from real-world scenarios and case studies.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16">
                    <p className="text-lg md:text-xl text-gray-600">
                        Whether you're a data analyst, accountant, or business professional, this course
                        will help you leverage the full potential of MS Excel to solve complex problems
                        and streamline workflows.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-12 border-t pt-8">
                    <p className="text-lg md:text-xl font-medium text-gray-800 mb-4 sm:mb-0">
                        Duration: <span className="text-gray-600">5 Weeks</span>
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

export default AdvMsexel;
