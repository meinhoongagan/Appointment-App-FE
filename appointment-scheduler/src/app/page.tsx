// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  // Color scheme based on image
  // Pink: #F8D7DE (top section)
  // Light Yellow: #F5F8D4 (second section)
  // Mint: #A6D6D6 (third section)
  // Purple: #9A8BB0 (bottom section)
  
  return (
    <div className="min-h-screen bg-[#F8D7DE] bg-opacity-20">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-[#9A8BB0]">ScheduleSync</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/features" className="text-gray-600 hover:text-[#9A8BB0] font-medium">
                Features
              </Link>
              <Link href="/templates" className="text-gray-600 hover:text-[#9A8BB0] font-medium">
                Templates
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-[#9A8BB0] font-medium">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-[#9A8BB0] font-medium">
                Login
              </Link>
              <Link href="/signup" className="bg-[#9A8BB0] text-white px-4 py-2 rounded-full hover:bg-[#8A7BA0] transition duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Pink Background */}
      <div className="pt-20 pb-24 overflow-hidden bg-[#F8D7DE] bg-opacity-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-[#9A8BB0] bg-opacity-20 text-[#9A8BB0] mb-6">
              #1 SCHEDULING PLATFORM
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-8">
              Smart Scheduling.
              <br /> 
              Simplified Bookings.
              <br />
              <span className="text-[#9A8BB0]">Zero Hassle.</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
              ScheduleSync brings AI-powered appointment management and automated reminders into one seamless platform.
            </p>

            <div className="mt-10 flex justify-center gap-4">
              <Link href="/signup" className="bg-[#9A8BB0] text-white px-8 py-3 rounded-full hover:bg-[#8A7BA0] font-medium transition duration-300 shadow-md">
                Get Started for Free
              </Link>
              <Link href="/demo" className="bg-white text-[#9A8BB0] border border-[#9A8BB0] px-8 py-3 rounded-full hover:bg-[#F8D7DE] font-medium transition duration-300 shadow-md">
                Live Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Icons - Light Yellow Background */}
      <div className="py-16 bg-[#F5F8D4] bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-full mb-4 shadow-md">
                <svg className="h-7 w-7 text-[#9A8BB0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Smart Calendar</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-full mb-4 shadow-md">
                <svg className="h-7 w-7 text-[#9A8BB0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Reminders</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-full mb-4 shadow-md">
                <svg className="h-7 w-7 text-[#9A8BB0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Secure Access</h3>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white rounded-full mb-4 shadow-md">
                <svg className="h-7 w-7 text-[#9A8BB0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Analytics</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Feature Section - White Background */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">
              Work Smarter, Not Harder - With <span className="text-[#9A8BB0]">AI-Powered</span> Scheduling
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Automate appointments, streamline client interactions, and stay organized - all in one intelligent workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
              <div className="flex justify-center items-center h-14 w-14 rounded-full bg-[#F8D7DE] text-[#9A8BB0] mb-6">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Set your availability</h3>
              <p className="text-gray-500">
                Configure your working hours, breaks, and buffer times between appointments with our intuitive interface.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
              <div className="flex justify-center items-center h-14 w-14 rounded-full bg-[#F5F8D4] text-[#9A8BB0] mb-6">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Share your booking link</h3>
              <p className="text-gray-500">
                Give clients your personalized booking link or embed the scheduler directly on your website.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
              <div className="flex justify-center items-center h-14 w-14 rounded-full bg-[#A6D6D6] text-[#9A8BB0] mb-6">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Get booked automatically</h3>
              <p className="text-gray-500">
                Clients book available slots and receive confirmations while you focus on what matters most.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Preview Section - Mint Background */}
      <div className="py-20 bg-[#A6D6D6] bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-3xl overflow-hidden">
            <div className="bg-[#9A8BB0] p-6 text-white">
              <h3 className="text-2xl font-medium">Calendar Interface Preview</h3>
              <p className="text-[#F8D7DE]">See how your customers will experience your booking flow</p>
            </div>
            <div className="h-96 p-8 flex items-center justify-center bg-white border-t border-gray-100">
              <div className="text-gray-400 text-center">
                <svg className="mx-auto h-14 w-14 text-[#F8D7DE]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-lg">Calendar visualization will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Section - Light Pink Background */}
      <div className="py-20 bg-[#F8D7DE] bg-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Loved by businesses everywhere</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-md transition duration-300 hover:shadow-lg">
              <p className="text-lg text-gray-600 italic mb-6">"This scheduling system has transformed how I run my salon. No more phone tag with clients!"</p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-[#F8D7DE] flex items-center justify-center">
                  <span className="text-[#9A8BB0] font-medium">SJ</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">Sarah Johnson</p>
                  <p className="text-gray-500">Hair Salon Owner</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-md transition duration-300 hover:shadow-lg">
              <p className="text-lg text-gray-600 italic mb-6">"The reminder system has cut our no-show rate by 80%. Well worth the investment."</p>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-[#A6D6D6] flex items-center justify-center">
                  <span className="text-[#9A8BB0] font-medium">DC</span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-900">David Chen</p>
                  <p className="text-gray-500">Medical Practice Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Purple Background */}
      <div className="bg-[#9A8BB0] py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
          </h2>
          <p className="mt-4 text-lg text-[#F8D7DE]">
            Try it free for 14 days. No credit card required.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="bg-white text-[#9A8BB0] px-8 py-3 rounded-full hover:bg-[#F8D7DE] font-medium transition duration-300 shadow-md">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer - Dark Background */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Features</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Pricing</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Documentation</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Guides</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">About</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Blog</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Privacy</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Terms</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-[#F8D7DE]">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2025 ScheduleSync, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}