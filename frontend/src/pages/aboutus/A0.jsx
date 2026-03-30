import React, { useEffect, useState } from 'react';
import { usePlatform } from "../../context/PlatformContext";
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
    Target,
    Eye,
    Lightbulb,
    GraduationCap,
    Wrench,
    Rocket,
    ChevronRight,
    ArrowRight,
    MousePointer,
    Users,
    Award,
    Star,
    Clock,
    BookOpen,
    Zap,
    Heart
} from 'lucide-react';

const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full`}
                    style={{
                        background: `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.1})`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * 100 - 50],
                        x: [0, Math.random() * 100 - 50],
                        opacity: [0.1, 0.7, 0.1],
                    }}
                    transition={{
                        duration: Math.random() * 20 + 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    );
};

function ValueCard({ icon: Icon, title, description, color }) {
    return (
        <motion.div
            className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 ${color}`}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
            <p className="text-gray-600">{description}</p>
        </motion.div>
    );
}

function Button({ children, primary = false, secondary = false, onClick = () => { } }) {
    const getButtonClasses = () => {
        if (primary) return "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg";
        if (secondary) return "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg";
        return "bg-white text-blue-600 border border-blue-100 hover:bg-blue-50";
    };

    return (
        <motion.button
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${getButtonClasses()}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            {children}
            <ChevronRight className="w-4 h-4" />
        </motion.button>
    );
}

function StatCounter({ value, label, icon: Icon, color = "from-blue-500 to-purple-500" }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const end = value;
            const duration = 2000;
            const increment = end / (duration / 20);
            
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 20);
            return () => clearInterval(timer);
        }
    }, [inView, value]);

    return (
        <motion.div
            ref={ref}
            className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-center mb-4">
                <div className={`p-3 bg-gradient-to-r ${color} rounded-full text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <h3 className="text-4xl font-bold text-gray-800 mb-2">{count}+</h3>
            <p className="text-gray-600">{label}</p>
        </motion.div>
    );
}

function AboutHero() {
    const { platformName } = usePlatform();
    return (
        <section className="relative min-h-[600px] flex items-center justify-center text-center px-4 overflow-hidden bg-gray-900">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80" 
                    className="w-full h-full object-cover opacity-30" 
                    alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
            </div>
            <AnimatedBackground />
            <div className="container mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                        Empowering Students with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Future-Ready Tech Skills</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        {platformName} bridges the gap between learning and real-world applications with hands-on training and expert guidance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button primary>Get Started</Button>
                        <Button secondary>Our Courses</Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function AboutUs() {
    return (
        <div className="bg-gray-50">
            <AboutHero />
            
            {/* Stats */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <StatCounter value={500} label="Students Trained" icon={Users} color="from-blue-500 to-purple-500" />
                    <StatCounter value={25} label="Expert Instructors" icon={GraduationCap} color="from-purple-500 to-pink-500" />
                    <StatCounter value={30} label="Courses Offered" icon={BookOpen} color="from-orange-500 to-red-500" />
                    <StatCounter value={95} label="Success Rate %" icon={Rocket} color="from-blue-500 to-cyan-500" />
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-block p-3 bg-blue-100 rounded-full text-blue-600 mb-6 font-bold flex items-center gap-2">
                                <Target size={24} /> Our Mission
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Cutting-Edge Tech Education</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our mission is to provide students with cutting-edge tech education, ensuring they are industry-ready with practical skills and real-world exposure. We believe in learning by doing.
                            </p>
                        </motion.div>
                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80" 
                                className="rounded-2xl shadow-2xl relative z-10" 
                                alt="Mission"
                            />
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-row-reverse">
                        <motion.div
                            className="md:order-2"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-block p-3 bg-purple-100 rounded-full text-purple-600 mb-6 font-bold flex items-center gap-2">
                                <Eye size={24} /> Our Vision
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-6">Leading Technology Education</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                To be a leading institute in technology education, empowering students to innovate and shape the digital future. We prepare them for the challenges of tomorrow.
                            </p>
                        </motion.div>
                        <motion.div
                            className="relative md:order-1"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80" 
                                className="rounded-2xl shadow-2xl relative z-10" 
                                alt="Vision"
                            />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800">Our Core Values</h2>
                        <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <ValueCard icon={Lightbulb} title="Innovation" description="We embrace the latest tech trends to provide cutting-edge education." color="border-blue-500" />
                        <ValueCard icon={GraduationCap} title="Excellence" description="High standards of training designed by industry experts." color="border-purple-500" />
                        <ValueCard icon={Wrench} title="Practicality" description="Learn by doing with hands-on projects and real applications." color="border-orange-500" />
                        <ValueCard icon={Rocket} title="Success" description="Our goal is to see our students excel in their professional careers." color="border-pink-500" />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutUs;
