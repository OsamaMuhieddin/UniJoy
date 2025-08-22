"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast, useToast } from "@/hooks/use-toast";
import ContactInfo from "../ui/ContactInfo";
const Contact = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        fullName: "", phone: "", subject: "", date: "", message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("تم إرسال الرسالة بنجاح!");
        setFormData({
            fullName: "", phone: "", subject: "", date: "", message: "",
        });
    };

    return (
        <div className="min-h-screen bg-white py-10 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <iframe
                            src="https://maps.google.com/maps?q=splash%20n%20party&t=&z=13&ie=UTF8&iwloc=&output=embed"
                            className="w-full h-full min-h-[400px] rounded-lg border"
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                    <div className="bg-blue-100 p-6 rounded-lg shadow-lg">
                        {/* نموذج الاتصال */}
                        <motion.form
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            onSubmit={handleSubmit}
                        >
                            <h2 className="text-2xl font-bold text-center text-blue-900 mb-10"> ابقى على تواصل معنا </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="الاسم بالكامل"
                                    required
                                    className="w-full px-4 py-3 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="هاتفك"
                                    required
                                    className="w-full px-4 py-3 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="العرض"
                                    required
                                    className="w-full px-4 py-3 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    placeholder="تاريخ / يوم / شهر / سنة"
                                    required
                                    className="w-full px-4 py-3 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <textarea
                                name="message"
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="فسر العرض"
                                required
                                className="w-full px-4 py-3 rounded border-none outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
                                > إرسال
                                </button>
                            </div>
                        </motion.form>
                    </div>
                </div>
                <ContactInfo />
            </div>
        </div>
    );
};

export default Contact;