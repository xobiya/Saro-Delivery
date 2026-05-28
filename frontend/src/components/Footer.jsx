import React from 'react';
import { Link } from 'react-router-dom';
import saroLogo from '../Assets/sarodelivery-removebg-preview.png';
import '../styles/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo flex items-center mb-4">
                            <img src={saroLogo} alt="Saro Delivery Logo" className="h-12 w-auto object-contain" />
                        </Link>
                        <p className="footer-description">
                            Experience the best food delivery service in Ethiopia. 
                            Fresh, fast, and delivered right to your doorstep.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/vendors">Browse Restaurants</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact Support</Link></li>
                            <li><Link to="/profile">My Account</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links">
                        <h4>For Partners</h4>
                        <ul>
                            <li><Link to="/register?role=vendor">Become a Vendor</Link></li>
                            <li><Link to="/register?role=driver">Become a Driver</Link></li>
                            <li><Link to="/vendor/login">Vendor Dashboard</Link></li>
                            <li><Link to="/driver/login">Driver Portal</Link></li>
                        </ul>
                    </div>

                    <div className="footer-newsletter">
                        <h4>Stay Updated</h4>
                        <p>Subscribe to get special offers and news.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Your email address" className="input" />
                            <button type="submit" className="btn btn-primary">Subscribe</button>
                        </form>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Saro Delivery. All rights reserved.</p>
                    <div className="footer-bottom-links">
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
