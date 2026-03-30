import React from "react";

const CTPProgramDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/1.png"
                        alt="Computer Technology Program"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Computer Technology Program (CTP)
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Stay ahead in the tech world with the Computer Technology Program. This course focuses on emerging technologies, AI tools, useful extensions, and practical apps, equipping you with skills for the digital age.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* Topic 1 */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">New Technologies:</span> Explore the latest innovations in AI and tech, including productivity apps, futuristic tools, and automation techniques that redefine efficiency.
                            </p>
                        </div>
                        {/* Topic 2 */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">AI Tools and Extensions:</span> ChatGPT: Advanced conversational AI for daily tasks, Merlin: AI-powered browser assistant, Grammarly: Writing and editing assistant, Ideogram: AI for creative design.
                            </p>
                        </div>
                        {/* Topic 3 */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Free Workshops:</span> Participate in free, hands-on workshops on emerging tools and technologies to apply what you learn in real-world scenarios.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        Why Choose This Program?
                    </h3>
                    <ul className="list-disc list-inside text-lg text-gray-600 max-w-2xl mx-auto space-y-2">
                        <li>Master cutting-edge AI tools and productivity extensions.</li>
                        <li>Boost your professional efficiency with innovative apps.</li>
                        <li>Stay updated with free tech workshops.</li>
                        <li>Learn practical, real-world applications of the latest technologies.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        Perfect for students, professionals, and tech enthusiasts looking to enhance their digital knowledge and stay ahead in the rapidly evolving world of technology.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-lg md:text-xl font-medium text-gray-800">
                        <strong>Duration:</strong> 6 Weeks <br />
                        <strong>Price:</strong> ₹7,999
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

export default CTPProgramDetail;
