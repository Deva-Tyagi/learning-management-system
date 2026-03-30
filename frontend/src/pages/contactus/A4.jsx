import React, { useState, useEffect } from "react";
import { usePlatform } from "../../context/PlatformContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const feedbackData = [
    {
        id: 1,
        name: "Rahul Sharma",
        role: "Full Stack Developer",
        message: `The advanced excel and programming courses at ${platformName} helped me land my first job in software development. Truly grateful!`,
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
        id: 2,
        name: "Anjali Gupta",
        role: "Graphic Designer",
        message: "The web design course was fantastic. Practical examples and hands-on projects made all the difference in my learning.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    },
    {
        id: 3,
        name: "Vikram Singh",
        role: "Data Analyst",
        message: "Excellent coaching and support. The instructors are very knowledgeable and always ready to clear our doubts.",
        rating: 4,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
];

const FeedbackSlider = () => {
    const { platformName } = usePlatform();
    const [index, setIndex] = useState(0);

    const next = () => setIndex(prev => (prev + 1) % feedbackData.length);
    const prev = () => setIndex(prev => (prev - 1 + feedbackData.length) % feedbackData.length);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-20 bg-indigo-50 px-8">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold text-gray-800 mb-16">Stories of Success</h2>
                
                <div className="relative bg-white p-12 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
                    <Quote className="absolute top-10 left-10 text-indigo-100 w-24 h-24 -rotate-12" />
                    
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.05, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="relative z-10"
                        >
                            <div className="mb-8 flex justify-center gap-1">
                                {[...Array(feedbackData[index].rating)].map((_, i) => (
                                    <Star key={i} className="text-yellow-400 fill-yellow-400 w-5 h-5" />
                                ))}
                            </div>
                            
                            <p className="text-2xl md:text-3xl text-gray-700 italic leading-relaxed mb-10">
                                "{feedbackData[index].message}"
                            </p>
                            
                            <div className="flex flex-col items-center">
                                <img 
                                    src={feedbackData[index].avatar} 
                                    className="w-20 h-20 rounded-full border-4 border-indigo-100 mb-4 shadow-xl" 
                                    alt={feedbackData[index].name}
                                />
                                <h4 className="text-xl font-bold text-gray-900">{feedbackData[index].name}</h4>
                                <p className="text-indigo-600 font-semibold">{feedbackData[index].role}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute inset-y-0 left-4 flex items-center">
                        <button onClick={prev} className="p-3 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-md">
                            <ChevronLeft size={24} />
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-4 flex items-center">
                        <button onClick={next} className="p-3 bg-indigo-50 rounded-full text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-md">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeedbackSlider;
