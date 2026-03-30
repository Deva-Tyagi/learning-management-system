import React from "react";

const EnglishSpeakingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/english.jpeg"
                        alt="English Speaking Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Master English Speaking
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Improve your English communication skills with this comprehensive course. Enhance your personality, perfect your spoken English, and get ready for interviews with personalized one-on-one practice.
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
                                <span className="font-bold">Personality Development:</span> Boost your self-confidence and communication skills. Learn effective body language, tone, and posture to create a positive first impression.
                            </p>
                        </div>
                        {/* Topic 2 */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">English Spoken Skills:</span> Improve fluency in spoken English. Learn how to structure sentences, use proper grammar, and expand your vocabulary to speak confidently in everyday conversations.
                            </p>
                        </div>
                        {/* Topic 3 */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Interview Preparation:</span> Prepare for interviews by mastering commonly asked questions, learning the art of self-presentation, and practicing professional communication.
                            </p>
                        </div>
                        {/* Topic 4 */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">One-on-One Spoken Practice:</span> Get personalized practice sessions with one-on-one feedback to improve your fluency, pronunciation, and confidence in speaking English.
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
                        <li>Develop strong communication skills and boost your confidence.</li>
                        <li>Enhance your speaking fluency for personal and professional settings.</li>
                        <li>Prepare for interviews and career advancement with mock interview sessions.</li>
                        <li>Receive one-on-one attention for faster improvement.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        This course is designed for anyone looking to improve their English communication skills, whether for personal growth, job interviews, or public speaking.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-xl font-medium text-gray-800">
                        <strong>Duration:</strong> 6 Weeks
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

export default EnglishSpeakingCourseDetail;
