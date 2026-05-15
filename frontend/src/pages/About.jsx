import aboutImage from '../Assets/top-view-indian-food-assortment.jpg';

const About = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <section className="text-center mb-20 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 font-display">
                        About <span className="text-orange-500">Saro Delivery</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Connecting you with the authentic flavors of Arba Minch, delivered right to your doorstep.
                    </p>
                </section>

                {/* Content Section */}
                <section className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Image Block */}
                    <div className="w-full lg:w-1/2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:-translate-y-2 transition-transform duration-500">
                            <img
                                src={aboutImage}
                                alt="Delivery Team"
                                className="w-full h-[400px] object-cover"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            <div className="absolute bottom-6 left-6 text-white">
                                <p className="font-bold text-2xl">Fast & Fresh</p>
                                <p className="opacity-90">Every single time.</p>
                            </div>
                        </div>
                    </div>

                    {/* Text Block */}
                    <div className="w-full lg:w-1/2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
                                <span className="bg-orange-100 text-orange-500 p-2 rounded-lg mr-3">🚀</span>
                                Our Mission
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Saro Delivery was founded to bridge the gap between hungry customers and the best local restaurants and hotels.
                                We believe that getting great food delivered should be fast, easy, and undeniably reliable.
                            </p>

                            <h3 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
                                <span className="bg-green-100 text-green-500 p-2 rounded-lg mr-3">⭐</span>
                                Why Choose Us?
                            </h3>
                            <ul className="space-y-6">
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold mr-4">1</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Local Focus</h4>
                                        <p className="text-gray-500 mt-1">We partner exclusively with the most trusted and authentic Arba Minch vendors.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold mr-4">2</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Incredible Speed</h4>
                                        <p className="text-gray-500 mt-1">Our dedicated fleet of drivers ensures your food arrives piping hot.</p>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold mr-4">3</div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Community First</h4>
                                        <p className="text-gray-500 mt-1">We support local businesses and create meaningful jobs for delivery drivers.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
