import { useState } from 'react';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you, ${formData.name}! We have received your message.`);
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 font-display">Get in Touch</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We'd love to hear from you! Whether you need support, want to partner with us, or have feedback, our team is ready to help.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    
                    {/* Contact Info Sidebar */}
                    <div className="w-full lg:w-2/5 bg-gray-900 text-white p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 opacity-20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold mb-10 font-display">Contact Information</h3>
                            
                            <div className="space-y-8">
                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-6 group-hover:bg-orange-500 transition-colors">
                                        <FaMapMarkerAlt className="text-xl" />
                                    </div>
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Our Location</h4>
                                        <p className="text-lg font-medium leading-relaxed">Sikela Main Road<br/>Arba Minch, Ethiopia</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-6 group-hover:bg-orange-500 transition-colors">
                                        <FaEnvelope className="text-xl" />
                                    </div>
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Email Us</h4>
                                        <p className="text-lg font-medium">support@saro.com</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start group">
                                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-6 group-hover:bg-orange-500 transition-colors">
                                        <FaPhoneAlt className="text-xl" />
                                    </div>
                                    <div>
                                        <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">Call Us</h4>
                                        <p className="text-lg font-medium">+251 911 22 33 44</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="w-full lg:w-3/5 p-10 md:p-14">
                        <h3 className="text-2xl font-bold mb-8 text-gray-900">Send us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Your Message</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors resize-y"
                                    rows="5"
                                    placeholder="How can we help you today?"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
