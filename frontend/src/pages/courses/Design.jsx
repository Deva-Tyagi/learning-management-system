import React from "react";

const DesigningEditingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/6.png"
                        alt="Designing and Editing Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Designing and Editing Mastery
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Master the art of designing and editing with hands-on training in industry-standard tools like CorelDRAW
                    and Photoshop. Learn 50+ advanced tricks to create stunning visuals and professional-grade designs.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* CorelDRAW */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">CorelDRAW:</span> Create professional vector graphics and illustrations, learn advanced layout techniques for print and digital media, design logos, brochures, and marketing materials.
                            </p>
                        </div>

                        {/* Photoshop */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Photoshop:</span> Edit and enhance photos with precision, learn retouching, compositing, and advanced effects, create web designs and UI/UX mockups.
                            </p>
                        </div>

                        {/* 50+ Tricks */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">50+ Design and Editing Tricks:</span> Master time-saving shortcuts for designing and editing, learn advanced color correction and blending techniques, optimize designs for print and web platforms.
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
                        <li>Gain professional expertise in CorelDRAW and Photoshop.</li>
                        <li>Learn industry-relevant tricks to enhance productivity.</li>
                        <li>Build an impressive portfolio with real-world projects.</li>
                        <li>Perfect for aspiring graphic designers and creative professionals.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        This course is tailored for creative enthusiasts, students, and professionals who want to excel in graphic designing and editing. Achieve mastery in design tools and techniques.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-xl font-medium text-gray-800">
                        Duration: <span className="text-gray-600">8 Weeks</span>
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

export default DesigningEditingCourseDetail;
