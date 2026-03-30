import React, { useRef } from "react";
import { usePlatform } from "../../context/PlatformContext";
import { motion, useInView } from "framer-motion";
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    Calendar,
    MessageSquare
} from "lucide-react";

const ContactInfoSection = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, threshold: 0.2 });
    const { platformName, supportEmail, supportPhone } = usePlatform();

    const contactItems = [
        {
            icon: Mail,
            title: "Email Us",
            description: "For any questions, feel free to reach out.",
            info: supportEmail,
            color: "from-blue-500 to-purple-500",
        },
        {
            icon: Phone,
            title: "Call Us",
            description: "Reach us during office hours.",
            info: supportPhone,
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: MapPin,
            title: "Visit Us",
            description: "Main Market, Sector-2, NOIDA",
            info: "Uttar Pradesh, India",
            color: "from-orange-500 to-red-500",
        },
    ];

    const infoItems = [
        {
            icon: Clock,
            title: "Working Hours",
            description: "Mon - Sat: 8:00 AM - 8:00 PM\nSun: Closed",
            color: "from-blue-500 to-cyan-500",
        },
        {
            icon: Calendar,
            title: "Counseling",
            description: "Schedule a session with our experts.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: MessageSquare,
            title: "Live Chat",
            description: "Connect with us on WhatsApp for fast help.",
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <section ref={sectionRef} className="py-20 px-8 bg-white overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Contact Information</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Get in touch with us for any inquiries, support, or feedback.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="bg-gray-50 p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`p-4 bg-gradient-to-r ${item.color} rounded-2xl text-white mb-6 transform group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                <p className="text-gray-600 mb-4">{item.description}</p>
                                <p className="text-lg font-bold text-blue-600">{item.info}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {infoItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4"
                        >
                            <div className={`p-3 bg-gradient-to-r ${item.color} rounded-xl text-white shrink-0`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
                                <p className="text-gray-600 whitespace-pre-line">{item.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative border-4 border-white"
                >
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d112117.47211145!2d77.2611681!3d28.5807904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5a43173357b%3A0x37ffce30cdd8e3d!2sNoida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1711234567890!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        title={`${platformName} Location`}
                    ></iframe>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactInfoSection;
