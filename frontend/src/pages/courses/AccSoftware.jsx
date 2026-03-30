import React, { useState, useEffect } from "react";
import {
    BookOpen,
    Calendar,
    CheckCircle,
    Award,
    Users,
    Briefcase,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    FileText,
    BarChart2,
    Zap,
    Star
} from "lucide-react";

const AccountingSoftwareCourseDetail = () => {
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [animateCount, setAnimateCount] = useState(false);
    const [count, setCount] = useState(0);
    const targetCount = 2500;

    // Animation for elements on page load
    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Animation for student count
    useEffect(() => {
        const handleScroll = () => {
            const countElement = document.getElementById('student-count');
            if (countElement) {
                const rect = countElement.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    setAnimateCount(true);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Counter animation
    useEffect(() => {
        if (animateCount) {
            const duration = 2000; // 2 seconds
            const interval = 20; // Update every 20ms
            const steps = duration / interval;
            const increment = targetCount / steps;
            let currentCount = 0;

            const timer = setInterval(() => {
                currentCount += increment;
                if (currentCount >= targetCount) {
                    setCount(targetCount);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(currentCount));
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [animateCount]);

    const handleEnrollClick = () => {
        setIsEnrolling(true);
        // Simulate form submission
        setTimeout(() => {
            setIsEnrolling(false);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        }, 1500);
    };

    const toggleFaq = (index) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };


    const faqs = [
        {
            question: "Do I need prior accounting knowledge for this course?",
            answer: "No prior accounting knowledge is required. The course is designed to start from the basics and gradually progress to advanced concepts. However, basic computer skills are recommended."
        },
        {
            question: "Will I receive a certificate upon completion?",
            answer: "Yes, you will receive an industry-recognized certificate upon successful completion of the course and passing the final assessment."
        },
        {
            question: "Are there any job placement opportunities after the course?",
            answer: "We offer job placement assistance to top performers. Our industry connections help students secure internships and job opportunities in accounting and finance roles."
        },
        {
            question: "Can I access the course materials after completion?",
            answer: "Yes, you will have lifetime access to the course materials, including any future updates to the content."
        }
    ];

    const modules = [
        {
            title: "Introduction to Accounting Software",
            duration: "1 week",
            topics: ["Basics of computerized accounting", "Introduction to Tally Prime", "Setting up company profiles"]
        },
        {
            title: "Financial Transactions & Ledgers",
            duration: "2 weeks",
            topics: ["Creating and managing ledgers", "Recording day-to-day transactions", "Journal and voucher entries"]
        },
        {
            title: "Inventory Management",
            duration: "1 week",
            topics: ["Stock categories and groups", "Inventory valuation methods", "Stock reports and analysis"]
        },
        {
            title: "Taxation & Compliance",
            duration: "2 weeks",
            topics: ["GST setup and configuration", "TDS management", "Tax reports and returns"]
        },
        {
            title: "Financial Reporting",
            duration: "1 week",
            topics: ["Balance sheet preparation", "Profit & Loss statements", "Cash flow analysis"]
        },
        {
            title: "Advanced Features & Case Studies",
            duration: "1 week",
            topics: ["Payroll management", "Multi-currency accounting", "Real-world accounting scenarios"]
        }
    ];

    return (
        <>
            {/* Hero Section with Parallax Effect */}
            <div className="relative h-[500px] overflow-hidden mt-16">
                <div
                    className="absolute inset-0 bg-cover bg-center transform transition-transform duration-[3000ms]"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
                        transform: isVisible ? "translateY(0)" : "translateY(-20px)"
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>
                </div>

                <div className="relative h-full flex flex-col items-center justify-center text-white px-8 z-10">
                    <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <div className="flex items-center justify-center mb-4">
                            <BookOpen size={40} className="text-orange-400 mr-3" />
                            <h1 className="text-5xl font-extrabold text-center">Master Accounting Software</h1>
                        </div>
                        <p className="text-xl text-center max-w-3xl mx-auto mt-4 text-gray-200">
                            Become an accounting professional with industry-standard software skills and practical knowledge
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 mt-8">
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Calendar className="text-orange-400 mr-2" size={20} />
                                <span>8 Weeks Duration</span>
                            </div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Users className="text-orange-400 mr-2" size={20} />
                                <span id="student-count">{count.toLocaleString()}+ Students</span>
                            </div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Star className="text-orange-400 mr-2" size={20} />
                                <span>4.8/5 Rating</span>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <button
                                onClick={handleEnrollClick}
                                disabled={isEnrolling}
                                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center">
                                    {isEnrolling ? (
                                        <>
                                            <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Enroll Now
                                            <Zap className="ml-2 group-hover:animate-pulse" size={20} />
                                        </>
                                    )}
                                </span>
                                <span className="absolute bottom-0 left-0 w-full h-0 bg-orange-700 transition-all duration-300 group-hover:h-full -z-0"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
                    <div className="flex items-center">
                        <CheckCircle className="mr-2" />
                        <span>Enrollment request submitted successfully!</span>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="sticky top-0 bg-white shadow-md z-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex overflow-x-auto hide-scrollbar space-x-1 py-4">
                        {["overview", "curriculum", "benefits", "faq"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${activeTab === tab
                                        ? "bg-blue-600 text-white font-semibold"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <section className="py-16 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto">
                    {/* Overview Section */}
                    <div id="overview" className={`transition-opacity duration-500 ${activeTab === "overview" ? "block opacity-100" : "hidden opacity-0"}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6 border-l-4 border-orange-500 pl-4">
                                    Course Overview
                                </h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Gain expertise in accounting software like <strong>Tally Prime</strong> and acquire industrial-level knowledge to manage financial records, taxation, and business accounts with precision.
                                </p>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    This comprehensive course is designed for students, professionals, and entrepreneurs looking to enhance their accounting expertise with industry-ready tools and techniques.
                                </p>

                                <div className="mt-8 grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                        <div className="flex items-center text-blue-600 mb-2">
                                            <FileText size={20} className="mr-2" />
                                            <h3 className="font-semibold">6 Modules</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">Comprehensive curriculum</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                        <div className="flex items-center text-blue-600 mb-2">
                                            <Clock size={20} className="mr-2" />
                                            <h3 className="font-semibold">40+ Hours</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">Of in-depth content</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                        <div className="flex items-center text-blue-600 mb-2">
                                            <BarChart2 size={20} className="mr-2" />
                                            <h3 className="font-semibold">12 Projects</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">Hands-on experience</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                                        <div className="flex items-center text-blue-600 mb-2">
                                            <Award size={20} className="mr-2" />
                                            <h3 className="font-semibold">Certificate</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm">Industry recognized</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`relative transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                                <img
                                    src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                                    alt="Accounting Professional"
                                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                                    <div className="flex items-center">
                                        <div className="bg-orange-500 text-white p-3 rounded-full mr-3">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <p className="text-gray-800 font-bold">Industry Demand</p>
                                            <p className="text-gray-600 text-sm">High-paying career path</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What You Will Learn Section */}
                        <div className="mb-16">
                            <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                                What You Will Learn
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <BookOpen className="text-blue-500 mr-3" size={24} />
                                        Tally Prime Proficiency
                                    </h4>
                                    <ul className="space-y-3">
                                        {[
                                            "Set up company accounts from scratch",
                                            "Record and manage daily transactions",
                                            "Inventory management and tracking",
                                            "Generate GST-compliant invoices",
                                            "Manage payroll and employee records",
                                            "Prepare financial statements and reports"
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" size={18} />
                                                <span className="text-gray-600">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-500 hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
                                    <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <Briefcase className="text-orange-500 mr-3" size={24} />
                                        Industrial-Level Accounting
                                    </h4>
                                    <ul className="space-y-3">
                                        {[
                                            "Taxation (GST, TDS, Income Tax)",
                                            "Budgeting and financial planning",
                                            "Bank reconciliation statements",
                                            "Financial reporting and analysis",
                                            "Compliance with statutory requirements",
                                            "Real-world accounting case studies"
                                        ].map((item, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" size={18} />
                                                <span className="text-gray-600">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Curriculum Section */}
                    <div id="curriculum" className={`transition-opacity duration-500 ${activeTab === "curriculum" ? "block opacity-100" : "hidden opacity-0"}`}>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Course Curriculum
                        </h2>

                        <div className="space-y-6">
                            {modules.map((module, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className="p-6 border-l-4 border-blue-500">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xl font-semibold text-gray-800">
                                                Module {index + 1}: {module.title}
                                            </h3>
                                            <div className="flex items-center text-blue-600">
                                                <Clock size={18} className="mr-2" />
                                                <span>{module.duration}</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 space-y-2">
                                            {module.topics.map((topic, topicIndex) => (
                                                <div key={topicIndex} className="flex items-start">
                                                    <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-1" size={18} />
                                                    <span className="text-gray-600">{topic}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                            <div className="flex items-start">
                                <div className="bg-blue-500 p-3 rounded-full text-white mr-4">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Final Assessment & Certification</h3>
                                    <p className="text-gray-600">
                                        Complete a comprehensive final project that simulates real-world accounting scenarios.
                                        Upon successful completion, receive an industry-recognized certificate validating your
                                        expertise in accounting software and financial management.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div id="benefits" className={`transition-opacity duration-500 ${activeTab === "benefits" ? "block opacity-100" : "hidden opacity-0"}`}>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Why Choose This Course?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <BookOpen size={40} className="text-blue-500" />,
                                    title: "Comprehensive Curriculum",
                                    description: "Master Tally Prime with a structured learning path covering all essential aspects of computerized accounting."
                                },
                                {
                                    icon: <Users size={40} className="text-orange-500" />,
                                    title: "Expert Instructors",
                                    description: "Learn from industry professionals with years of practical experience in accounting and financial management."
                                },
                                {
                                    icon: <Briefcase size={40} className="text-green-500" />,
                                    title: "Industry-Relevant Skills",
                                    description: "Acquire practical skills that are in high demand across industries for accounting and finance roles."
                                },
                                {
                                    icon: <BarChart2 size={40} className="text-purple-500" />,
                                    title: "Hands-on Projects",
                                    description: "Apply your knowledge through practical projects based on real-world business scenarios."
                                },
                                {
                                    icon: <Award size={40} className="text-yellow-500" />,
                                    title: "Recognized Certification",
                                    description: "Earn a certificate that validates your expertise and enhances your professional credibility."
                                },
                                {
                                    icon: <Zap size={40} className="text-red-500" />,
                                    title: "Career Advancement",
                                    description: "Open doors to opportunities in accounting, finance, taxation, and business management."
                                }
                            ].map((benefit, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2"
                                >
                                    <div className="mb-4">{benefit.icon}</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-3">{benefit.title}</h3>
                                    <p className="text-gray-600">{benefit.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-8 text-white text-center">
                                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Career?</h3>
                                <p className="mb-6">
                                    Join thousands of successful professionals who have advanced their careers with our accounting software course.
                                </p>
                                <button
                                    onClick={handleEnrollClick}
                                    disabled={isEnrolling}
                                    className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg shadow hover:bg-gray-100 transition duration-300"
                                >
                                    {isEnrolling ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-blue-700 rounded-full"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        "Enroll Today"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div id="faq" className={`transition-opacity duration-500 ${activeTab === "faq" ? "block opacity-100" : "hidden opacity-0"}`}>
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-4 max-w-3xl mx-auto">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                                    >
                                        <span className="font-semibold text-gray-800">{faq.question}</span>
                                        {expandedFaq === index ? (
                                            <ChevronUp className="text-blue-500" />
                                        ) : (
                                            <ChevronDown className="text-gray-500" />
                                        )}
                                    </button>

                                    <div
                                        className={`px-6 overflow-hidden transition-all duration-300 ${expandedFaq === index ? "max-h-40 py-4" : "max-h-0 py-0"
                                            }`}
                                    >
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <p className="text-gray-600 mb-4">Still have questions?</p>
                            <button className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition duration-300 flex items-center mx-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-100">
                <div className="max-w-6xl mx-auto px-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">
                        What Our Students Say
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Priya Sharma",
                                role: "Financial Analyst",
                                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
                                quote: "This course transformed my understanding of accounting software. The hands-on approach helped me secure a position at a leading financial firm."
                            },
                            {
                                name: "Rahul Patel",
                                role: "Small Business Owner",
                                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
                                quote: "As a business owner, managing accounts was always challenging. This course simplified everything and now I can handle my business finances with confidence."
                            },
                            {
                                name: "Ananya Gupta",
                                role: "Accounting Graduate",
                                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80",
                                quote: "The curriculum is perfectly aligned with industry requirements. The practical knowledge I gained gave me an edge over other candidates during job interviews."
                            }
                        ].map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center mb-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover mr-4"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                <div className="mt-4 flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="max-w-4xl mx-auto px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Master Accounting Software?</h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Join our comprehensive course and transform your career with in-demand accounting skills.
                    </p>
                    <button
                        onClick={handleEnrollClick}
                        disabled={isEnrolling}
                        className="group relative px-8 py-4 bg-white text-blue-600 font-bold rounded-lg shadow-lg hover:bg-blue-50 transition-all duration-300"
                    >
                        {isEnrolling ? (
                            <div className="flex items-center">
                                <div className="animate-spin h-5 w-5 mr-3 border-t-2 border-blue-600 rounded-full"></div>
                                Processing...
                            </div>
                        ) : (
                            <span className="flex items-center">
                                Enroll Now
                                <Zap className="ml-2 group-hover:animate-pulse" size={20} />
                            </span>
                        )}
                    </button>
                </div>
            </section>

            {/* Custom CSS for hiding scrollbar */}
            <style dangerouslySetInnerHTML={{ __html: `
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
            ` }} />
        </>
    );
};

export default AccountingSoftwareCourseDetail;
