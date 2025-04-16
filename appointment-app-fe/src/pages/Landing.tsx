import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Bell, Users, Star, Check, ChevronRight, Menu, X } from "lucide-react";

const Landing = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Testimonial data
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Small Business Owner",
      text: "AppointEase transformed how I manage my salon appointments. My clients love the simplicity and I've saved hours on scheduling.",
      rating: 5
    },
    {
      name: "Mark Davis",
      role: "Fitness Trainer",
      text: "I've tried many scheduling apps, but AppointEase is hands down the most intuitive. My client base has grown 30% since I started using it.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Dental Practice Manager",
      text: "The automated reminders have reduced our no-shows by 60%. Absolutely worth every penny!",
      rating: 4
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header 
        className={`fixed w-full transition-all duration-300 z-50 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <h1 className={`text-2xl font-bold flex items-center ${isScrolled ? "text-gray-800" : "text-white"}`}>
              <span className="text-3xl mr-2">✨</span> 
              <span className="bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">AppointEase</span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/features" className={`font-medium hover:text-pink-500 transition ${isScrolled ? "text-gray-700" : "text-white"}`}>Features</Link>
            <Link to="/pricing" className={`font-medium hover:text-pink-500 transition ${isScrolled ? "text-gray-700" : "text-white"}`}>Pricing</Link>
            <Link to="/about" className={`font-medium hover:text-pink-500 transition ${isScrolled ? "text-gray-700" : "text-white"}`}>About</Link>
            <Link to="/login" className={`font-medium hover:text-pink-500 transition ${isScrolled ? "text-gray-700" : "text-white"}`}>Login</Link>
            <Link to="/register" className="bg-gradient-to-r from-pink-400 to-purple-600 text-white px-6 py-2 rounded-full font-medium hover:shadow-lg transition">
              Get Started
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={isScrolled ? "text-gray-800" : "text-white"} size={24} />
            ) : (
              <Menu className={isScrolled ? "text-gray-800" : "text-white"} size={24} />
            )}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-xl px-4 py-5 absolute top-full left-0 right-0 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link to="/features" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link to="/about" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link to="/login" className="text-gray-700 hover:text-pink-500 transition font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="bg-gradient-to-r from-pink-400 to-purple-600 text-white px-6 py-3 rounded-full font-medium text-center hover:shadow-lg transition" onClick={() => setMobileMenuOpen(false)}>
                Get Started
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-purple-600 via-pink-500 to-pink-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-12 md:mb-0">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Simplify Your <span className="relative">
                  Scheduling
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-yellow-300 opacity-50 rounded"></span>
                </span>
              </h2>
              <p className="text-lg md:text-xl text-white opacity-80 max-w-xl mb-8">
                Book services, manage appointments, and stay organized with our intuitive platform. Perfect for businesses and customers alike.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                <Link to="/register">
                  <button className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                    Start For Free
                  </button>
                </Link>
                <Link to="/demo">
                  <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full sm:w-auto">
                    See Demo
                  </button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center md:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className={`w-8 h-8 rounded-full border-2 border-white bg-pink-${num * 100} flex items-center justify-center text-xs font-bold text-white`}>
                      {num}
                    </div>
                  ))}
                </div>
                <p className="ml-4 text-white text-sm">
                  <span className="font-bold">2,500+</span> businesses trust us
                </p>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-white p-6 rounded-xl shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="bg-pink-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-purple-600">New Appointment</h4>
                    <span className="text-sm text-gray-500">Today</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="text-pink-500 mr-3" size={20} />
                      <div>
                        <p className="text-gray-700 font-medium">Choose Date</p>
                        <p className="text-sm text-gray-500">April 16, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="text-pink-500 mr-3" size={20} />
                      <div>
                        <p className="text-gray-700 font-medium">Choose Time</p>
                        <div className="flex space-x-2 mt-1">
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm hover:bg-purple-200 cursor-pointer">9:00</span>
                          <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">10:30</span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm hover:bg-purple-200 cursor-pointer">2:15</span>
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-pink-400 to-purple-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition">
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-yellow-100 p-4 rounded-lg shadow-lg transform -rotate-6 hover:rotate-0 transition-all duration-500 z-10">
                <div className="flex items-center">
                  <Bell className="text-yellow-500 mr-2" size={18} />
                  <p className="text-sm font-medium text-gray-700">Appointment reminder: Haircut at 2:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Features You'll Love</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Designed with both service providers and customers in mind, our platform streamlines every aspect of appointment scheduling.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-block p-4 bg-pink-100 rounded-lg mb-4">
                <Calendar className="text-pink-500" size={28} />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Smart Scheduling</h4>
              <p className="text-gray-600">Book appointments with intelligent time slot suggestions based on availability and preferences.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                  <span className="text-sm text-gray-600">Real-time availability updates</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                  <span className="text-sm text-gray-600">Flexible booking options</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-block p-4 bg-purple-100 rounded-lg mb-4">
                <Bell className="text-purple-500" size={28} />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Smart Reminders</h4>
              <p className="text-gray-600">Never miss an appointment with customizable notifications via email, SMS, or in-app alerts.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                  <span className="text-sm text-gray-600">Reduce no-shows by 60%</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                  <span className="text-sm text-gray-600">Custom reminder schedules</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-block p-4 bg-blue-100 rounded-lg mb-4">
                <Users className="text-blue-500" size={28} />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Role-based Access</h4>
              <p className="text-gray-600">Custom permissions for admins, service providers, and customers with intuitive interfaces.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                  <span className="text-sm text-gray-600">Customizable user permissions</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-500 mr-2 flex-shrink-0 mt-1" size={16} />
                  <span className="text-sm text-gray-600">Specialized dashboards by role</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/features">
              <button className="flex items-center mx-auto bg-transparent text-pink-500 font-medium hover:text-pink-600 transition">
                View All Features
                <ChevronRight size={18} className="ml-1" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">How It Works</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Get started in minutes with these simple steps</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0">
            {[
              {
                step: "1",
                title: "Create Your Account",
                description: "Sign up and set your preferences in just a few clicks.",
                color: "bg-pink-500"
              },
              {
                step: "2",
                title: "Set Your Availability",
                description: "Define when you're available for bookings.",
                color: "bg-purple-500"
              },
              {
                step: "3",
                title: "Share Your Booking Link",
                description: "Let clients schedule appointments instantly.",
                color: "bg-blue-500"
              }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center px-6 md:w-1/3">
                <div className={`${item.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4`}>
                  {item.step}
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.description}</p>
                
                {index < 2 && (
                  <div className="hidden md:block h-0.5 w-16 bg-gray-200 absolute transform translate-x-32"></div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/register">
              <button className="bg-gradient-to-r from-pink-400 to-purple-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Get Started For Free
              </button>
            </Link>
            <p className="mt-4 text-sm text-gray-500">No credit card required. Free 14-day trial.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">What Our Users Say</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Trusted by thousands of businesses worldwide</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center mb-6">
                <div className="mr-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-gray-500">{testimonials[activeTestimonial].role}</p>
                </div>
                <div className="ml-auto flex">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-500 fill-current" size={20} />
                  ))}
                </div>
              </div>
              
              <blockquote className="text-lg text-gray-700 italic mb-6">
                "{testimonials[activeTestimonial].text}"
              </blockquote>
              
              <div className="flex justify-center space-x-2">
                {testimonials.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full ${activeTestimonial === index ? 'bg-pink-500' : 'bg-gray-300'}`}
                    aria-label={`Testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Scheduling?</h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">
            Join thousands of satisfied users who have simplified their booking process with AppointEase.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/register">
              <button className="bg-white text-purple-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                Start Your Free Trial
              </button>
            </Link>
            <Link to="/contact">
              <button className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-300 w-full sm:w-auto">
                Contact Sales
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-12 pb-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center mb-4">
                <span className="text-3xl mr-2">✨</span> 
                <span className="bg-gradient-to-r from-pink-400 to-purple-600 bg-clip-text text-transparent">AppointEase</span>
              </h1>
              <p className="text-gray-400 mb-4">Simplifying scheduling for businesses and customers worldwide.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition">Integrations</Link></li>
                <li><Link to="/updates" className="text-gray-400 hover:text-white transition">What's New</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-400 hover:text-white transition">Help Center</Link></li>
                <li><Link to="/guides" className="text-gray-400 hover:text-white transition">Guides</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition">Careers</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition">Blog</Link></li>
                <li><Link to="/legal" className="text-gray-400 hover:text-white transition">Legal</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} AppointEase. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition">Privacy Policy</Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition">Terms of Service</Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;