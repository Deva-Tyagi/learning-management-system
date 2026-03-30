import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah Johnson",
        message: "The Web Development course completely transformed my career. I went from knowing nothing about coding to landing a job as a junior developer in just 3 months!",
        rating: 5,
        image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
        name: "Michael Chen",
        message: "The Advanced Excel course taught me skills I use every day in my job. The instructor's real-world examples made complex concepts easy to understand.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    {
        name: "Emily Rodriguez",
        message: "I've taken several digital marketing courses, but this one stands out for its practical approach. I was able to implement strategies immediately and see results.",
        rating: 4,
        image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
    {
        name: "David Wilson",
        message: "As a non-native speaker, the English Speaking course helped me gain confidence in client meetings. The personalized feedback was invaluable.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
        name: "Priya Patel",
        message: "The design course helped me master industry tools and techniques. I've since freelanced for major brands and doubled my income.",
        rating: 5,
        image: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
        name: "James Thompson",
        message: "The MS Office course taught me so many time-saving tricks. What used to take me hours now takes minutes. Highly recommended!",
        rating: 4,
        image: "https://randomuser.me/api/portraits/men/3.jpg"
    },
];

const FeedbackSection = () => {
    const [currentFeedbackIndex, setCurrentFeedbackIndex] = useState(0);
    const maxFeedbackIndex = Math.ceil(testimonials.length / 2) - 1;

    const handleNext = () => {
        setCurrentFeedbackIndex((prevIndex) =>
            prevIndex + 1 > maxFeedbackIndex ? 0 : prevIndex + 1
        );
    };

    const handlePrev = () => {
        setCurrentFeedbackIndex((prevIndex) =>
            prevIndex - 1 < 0 ? maxFeedbackIndex : prevIndex - 1
        );
    };

    const renderStars = (rating) => {
        return (
            <div className="flex mb-2">
                {Array.from({ length: 5 }, (_, index) => (
                    <Star
                        key={index}
                        size={20}
                        className={`${index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    const getVisibleFeedback = () => {
        const startIndex = currentFeedbackIndex * 2;
        return testimonials.slice(startIndex, startIndex + 2);
    };

    return (
        <section className="py-16 px-8 bg-gray-50">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
                    Testimonials from Our Students
                </h2>
                <p className="text-lg text-gray-600 mb-10">
                    Here's what students who have taken our courses have to say.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    {getVisibleFeedback().map((feedback, index) => (
                        <div key={index} className="flex items-start space-x-4 bg-white p-6 rounded-xl shadow-sm">
                            <img
                                src={feedback.image}
                                alt={feedback.name}
                                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                                {renderStars(feedback.rating)}
                                <p className="text-lg text-gray-700 mb-4 leading-relaxed italic">
                                    "{feedback.message}"
                                </p>
                                <h4 className="text-base font-semibold text-gray-800">
                                    - {feedback.name}
                                </h4>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center space-x-6 mt-12">
                    <button
                        onClick={handlePrev}
                        className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        <ChevronRight size={24} className="text-gray-600" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default FeedbackSection;
