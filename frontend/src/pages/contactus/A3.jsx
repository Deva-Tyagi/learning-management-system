import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, User, Mail, Phone, MessageSquare, Loader2 } from "lucide-react";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const formRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            alert("Message sent successfully!");
            setIsSubmitting(false);
            setFormData({ name: "", email: "", mobile: "", message: "" });
        }, 2000);
    };

    const inputVariants = {
        focused: { scale: 1.01, borderColor: "#4f46e5", boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.1)" },
        unfocused: { scale: 1, borderColor: "#e5e7eb", boxShadow: "none" }
    };

    return (
        <section className="py-20 px-8 bg-gray-50 overflow-hidden">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-stretch">
                <motion.div 
                    className="lg:w-5/12"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="sticky top-24">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8 group">
                            <img 
                                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80" 
                                className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-700" 
                                alt="Support"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 text-white">
                                <h3 className="text-3xl font-bold mb-2">We're Here For You</h3>
                                <p className="text-lg text-gray-300">Our support team is available during office hours.</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Counseling Helpline</p>
                                <p className="text-2xl font-black text-gray-800">+91 92055 96640</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    className="lg:w-7/12"
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">Send us a Message</h2>
                        <div className="h-1.5 w-24 bg-indigo-600 rounded-full mb-6"></div>
                        <p className="text-lg text-gray-600">
                            Have questions about our certification programs or career guidance? Fill out the form and our advisors will get back to you.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-50 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <motion.input
                                    variants={inputVariants}
                                    animate={focusedField === 'name' ? 'focused' : 'unfocused'}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    type="text" name="name" value={formData.name} onChange={handleInputChange} required
                                    className="w-full p-4 bg-gray-50 border rounded-xl outline-none" placeholder="Your Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Mail size={16} /> Email Address
                                </label>
                                <motion.input
                                    variants={inputVariants}
                                    animate={focusedField === 'email' ? 'focused' : 'unfocused'}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    type="email" name="email" value={formData.email} onChange={handleInputChange} required
                                    className="w-full p-4 bg-gray-50 border rounded-xl outline-none" placeholder="example@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone size={16} /> Phone Number
                            </label>
                            <motion.input
                                variants={inputVariants}
                                animate={focusedField === 'mobile' ? 'focused' : 'unfocused'}
                                onFocus={() => setFocusedField('mobile')}
                                onBlur={() => setFocusedField(null)}
                                type="tel" name="mobile" value={formData.mobile} onChange={handleInputChange} required
                                className="w-full p-4 bg-gray-50 border rounded-xl outline-none" placeholder="+91 XXXXX XXXXX"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <MessageSquare size={16} /> Your Message
                            </label>
                            <motion.textarea
                                variants={inputVariants}
                                animate={focusedField === 'message' ? 'focused' : 'unfocused'}
                                onFocus={() => setFocusedField('message')}
                                onBlur={() => setFocusedField(null)}
                                name="message" value={formData.message} onChange={handleInputChange} required rows={5}
                                className="w-full p-4 bg-gray-50 border rounded-xl outline-none resize-none" placeholder="How can we help you?"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" disabled={isSubmitting}
                            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {isSubmitting ? <><Loader2 className="animate-spin" /> Processing...</> : <><Send size={20} /> Send Inquiry Now</>}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactForm;
