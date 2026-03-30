import React from "react";

const DigitalMarketingCourseDetail = () => {
    return (
        <section className="py-16 mt-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Course Banner Image */}
                <div className="mb-12">
                    <img
                        src="/photos/digital.jpeg"
                        alt="Digital Marketing Course"
                        className="w-full h-72 md:h-96 rounded-lg shadow-lg object-cover"
                        onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&q=80";
                        }}
                    />
                </div>

                {/* Course Title */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 text-center">
                    Digital Marketing Masterclass
                </h2>

                {/* Course Introduction */}
                <p className="text-lg md:text-xl text-gray-600 mb-12 text-center leading-relaxed">
                    Master the art of digital marketing with hands-on training in SEO, Social Media Marketing, and developing
                    effective Marketing Strategies. This course is perfect for aspiring marketers and business owners looking to grow online.
                </p>

                {/* Course Topics */}
                <div className="mb-16">
                    <h3 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
                        What You Will Learn:
                    </h3>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* SEO Optimization */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">SEO Optimization:</span> Understand search engine algorithms and ranking factors, keyword research, on-page SEO, and link building. Track performance with Google Analytics and Search Console.
                            </p>
                        </div>

                        {/* Social Media Marketing */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Social Media Marketing:</span> Create impactful campaigns on platforms like Facebook, Instagram, and LinkedIn. Engage audiences through content marketing. Analyze campaign performance and optimize ROI.
                            </p>
                        </div>

                        {/* Marketing Strategies */}
                        <div className="flex items-start space-x-4">
                            <span className="text-green-600 text-2xl">&#10003;</span>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                <span className="font-bold">Marketing Strategies:</span> Develop tailored strategies for various business goals. Learn email marketing, funnels, and retargeting techniques. Understand customer behavior to drive engagement and conversions.
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
                        <li>Become proficient in essential digital marketing tools and techniques.</li>
                        <li>Gain the ability to create and implement marketing strategies for real-world businesses.</li>
                        <li>Prepare for high-demand digital marketing roles.</li>
                        <li>Ideal for entrepreneurs, professionals, and students.</li>
                    </ul>
                </div>

                {/* Course Summary */}
                <div className="text-center mb-16 border-t pt-8">
                    <p className="text-lg md:text-xl text-gray-600">
                        This course is designed to equip you with the skills to thrive in the digital space. Whether you're growing your business or pursuing a career in marketing, this course is your gateway to success.
                    </p>
                </div>

                {/* Course Information */}
                <div className="flex justify-between items-center mb-12">
                    <p className="text-xl font-medium text-gray-800">
                        Duration: <span className="text-gray-600">6 Weeks</span>
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

export default DigitalMarketingCourseDetail;
