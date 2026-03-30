import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const ContactInfoCards = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <section className="py-16 px-8 bg-white">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-12 rounded-3xl shadow-2xl overflow-hidden relative"
            >
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                <div className="flex flex-col lg:flex-row gap-16 items-start relative z-10">
                    <div className="lg:w-1/2 text-white">
                        <h2 className="text-4xl font-bold mb-6">Let's Connect</h2>
                        <div className="h-1.5 w-20 bg-yellow-400 rounded-full mb-8"></div>
                        <p className="text-xl leading-relaxed mb-8 text-indigo-100">
                            We're here to help you on your learning journey. Our team of experts is ready to provide guidance and support whenever you need it.
                        </p>
                    </div>

                    <div className="lg:w-1/2 w-full">
                        <motion.div
                            className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <div className="space-y-8">
                                <motion.div className="flex items-start gap-5" variants={itemVariants}>
                                    <div className="bg-indigo-100 p-4 rounded-xl text-indigo-600">
                                        <Mail size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-1">Email</p>
                                        <p className="text-lg font-bold text-gray-800">miccflyhigh@gmail.com</p>
                                        <a href="mailto:miccflyhigh@gmail.com" className="text-indigo-500 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1 mt-2 transition-colors">
                                            Write to us <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </motion.div>

                                <motion.div className="flex items-start gap-5" variants={itemVariants}>
                                    <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
                                        <Phone size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wider text-purple-600 mb-1">Phone</p>
                                        <p className="text-lg font-bold text-gray-800">+91 92055 96640</p>
                                        <a href="tel:+919205596640" className="text-purple-500 hover:text-purple-700 text-sm font-semibold flex items-center gap-1 mt-2 transition-colors">
                                            Call us <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </motion.div>

                                <motion.div className="flex items-start gap-5" variants={itemVariants}>
                                    <div className="bg-orange-100 p-4 rounded-xl text-orange-600">
                                        <MapPin size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-1">Address</p>
                                        <p className="text-lg font-bold text-gray-800">Sector-2, NOIDA, UP, India</p>
                                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-700 text-sm font-semibold flex items-center gap-1 mt-2 transition-colors">
                                            View on map <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default ContactInfoCards;
