import React from "react";
import { CheckCircle } from "lucide-react";

const VideoEditingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/5.png"
                        alt="Video Editing Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Master Video Editing
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Learn the art of video editing with advanced tools like Premiere Pro, Wondershare Filmora, and gain expertise in sound design, graphics, and VFX to create professional-quality videos.
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
                                <span className="font-bold">Advanced Premiere Pro Techniques:</span> Dive deep into Adobe Premiere Pro and learn advanced editing techniques, including multi-camera editing, motion graphics, and color grading.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Wondershare Filmora Mastery:</span> Master Wondershare Filmora, an intuitive video editor. Learn how to use its rich features like transitions, filters, and speed adjustments for effective storytelling.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Sound Design for Video:</span> Understand the fundamentals of sound design and how to incorporate sound effects, music, and voice-overs to enhance your video production.
                            </p>
                        </div>
                        <div className="flex items-start space-x-4">
                            <CheckCircle className="text-green-600 text-2xl flex-shrink-0" size={24} />
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Graphics & VFX:</span> Learn how to create stunning visuals using graphics and VFX techniques, from motion graphics to 3D rendering, to elevate your video content.
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
                        <li>Master industry-standard video editing tools like Premiere Pro and Filmora.</li>
                        <li>Learn advanced techniques for video production, sound, and visual effects.</li>
                        <li>Improve your skills in graphics and VFX to create professional videos.</li>
                        <li>Perfect for video editors, filmmakers, and content creators aiming for high-quality production.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        This course is designed for both beginners and professionals who want to sharpen their video editing skills and create visually stunning content with sound design and VFX expertise.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-xl font-medium text-gray-800">
                        <strong>Duration:</strong> 8 Weeks
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

export default VideoEditingCourseDetail;
