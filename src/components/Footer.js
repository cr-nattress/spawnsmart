import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        {/* Main footer content with multiple columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">About SpawnSmart</h3>
            <ul className="space-y-2">
              <li><a href="/about/our-story" className="hover:text-green-300 transition-colors duration-200">Our Story</a></li>
              <li><a href="/about/mission" className="hover:text-green-300 transition-colors duration-200">Mission</a></li>
              <li><a href="/about/team" className="hover:text-green-300 transition-colors duration-200">Team</a></li>
              <li><a href="/about/testimonials" className="hover:text-green-300 transition-colors duration-200">Testimonials</a></li>
            </ul>
          </div>
          
          {/* Column 2 - Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/resources/cultivation-guides" className="hover:text-green-300 transition-colors duration-200">Cultivation Guides</a></li>
              <li><a href="/resources/species-database" className="hover:text-green-300 transition-colors duration-200">Species Database</a></li>
              <li><a href="/resources/substrate-recipes" className="hover:text-green-300 transition-colors duration-200">Substrate Recipes</a></li>
              <li><a href="/resources/troubleshooting" className="hover:text-green-300 transition-colors duration-200">Troubleshooting</a></li>
              <li><a href="/resources/faq" className="hover:text-green-300 transition-colors duration-200">FAQ</a></li>
            </ul>
          </div>
          
          {/* Column 3 - Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Community</h3>
            <ul className="space-y-2">
              <li><a href="/community/forum" className="hover:text-green-300 transition-colors duration-200">Forum</a></li>
              <li><a href="/community/events" className="hover:text-green-300 transition-colors duration-200">Events</a></li>
              <li><a href="/community/newsletter" className="hover:text-green-300 transition-colors duration-200">Newsletter</a></li>
              <li><a href="/community/success-stories" className="hover:text-green-300 transition-colors duration-200">Success Stories</a></li>
            </ul>
          </div>
          
          {/* Column 4 - Connect */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-400">Connect</h3>
            <ul className="space-y-2">
              <li><a href="/connect/contact" className="hover:text-green-300 transition-colors duration-200">Contact Us</a></li>
              <li><a href="/connect/support" className="hover:text-green-300 transition-colors duration-200">Support</a></li>
              <li><a href="/connect/partnerships" className="hover:text-green-300 transition-colors duration-200">Partnerships</a></li>
              <li><a href="/connect/affiliate" className="hover:text-green-300 transition-colors duration-200">Affiliate Program</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom footer with copyright and legal links */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} SpawnSmart. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="/legal/privacy" className="text-sm text-gray-400 hover:text-green-300 transition-colors duration-200">Privacy Policy</a>
              <a href="/legal/terms" className="text-sm text-gray-400 hover:text-green-300 transition-colors duration-200">Terms of Service</a>
              <a href="/legal/cookies" className="text-sm text-gray-400 hover:text-green-300 transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
