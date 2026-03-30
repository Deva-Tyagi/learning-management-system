import React from "react";

const CCCAndOLevelCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/7.png"
                        alt="CCC and O-Level Courses"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    NIELIT Certification Courses
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Get certified with NIELIT's prestigious CCC and O-Level courses. Develop essential computer knowledge and technical skills, opening doors to a wide range of career opportunities in IT and administrative roles.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Courses Offered:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* CCC Course */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">CCC Course:</span> Basic computer concepts and fundamentals, Word processing, spreadsheets, and presentations. Internet, email, and social media basics, Digital financial literacy.
                            </p>
                        </div>

                        {/* O-Level Course */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">O-Level Course:</span> Programming and problem-solving using Python, Introduction to database management systems, Networking and internet concepts, Practical projects for industrial applications.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Why Choose These Courses?
                    </h3>
                    <ul className="list-disc list-inside text-lg text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Recognized by the Government of India for IT roles</li>
                        <li>Enhances employability in IT and administrative sectors</li>
                        <li>Perfect foundation for advanced IT certifications</li>
                        <li>Practical, hands-on learning for real-world application</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        Both CCC and O-Level courses are ideal for students, job seekers, and professionals aiming to build or enhance their IT knowledge. Enroll today to gain industry-relevant skills and certification.
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

export default CCCAndOLevelCourseDetail;
