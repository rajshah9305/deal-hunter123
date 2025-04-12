import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-[#1C1C28] text-white py-6 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FFB800] mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 8v8H8V8h8m2-2H6v12h12V6z" />
              <path d="M14 2H4v12h2V4h8V2z" />
              <path d="M20 10h-2v8h-8v2h10V10z" />
            </svg>
            <span className="font-display text-lg font-bold tracking-tight">DealFlip</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div>
              <h3 className="text-[#FFB800] text-sm font-medium mb-2">Platform</h3>
              <ul className="text-sm space-y-2">
                <li><Link to="/features"><a className="hover:text-[#FFB800] transition-all">Features</a></Link></li>
                <li><Link to="/pricing"><a className="hover:text-[#FFB800] transition-all">Pricing</a></Link></li>
                <li><Link to="/technology"><a className="hover:text-[#FFB800] transition-all">AI Technology</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#FFB800] text-sm font-medium mb-2">Resources</h3>
              <ul className="text-sm space-y-2">
                <li><Link to="/blog"><a className="hover:text-[#FFB800] transition-all">Blog</a></Link></li>
                <li><Link to="/guides"><a className="hover:text-[#FFB800] transition-all">Guides</a></Link></li>
                <li><Link to="/help"><a className="hover:text-[#FFB800] transition-all">Help Center</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#FFB800] text-sm font-medium mb-2">Company</h3>
              <ul className="text-sm space-y-2">
                <li><Link to="/about"><a className="hover:text-[#FFB800] transition-all">About</a></Link></li>
                <li><Link to="/careers"><a className="hover:text-[#FFB800] transition-all">Careers</a></Link></li>
                <li><Link to="/contact"><a className="hover:text-[#FFB800] transition-all">Contact</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-[#FFB800] text-sm font-medium mb-2">Legal</h3>
              <ul className="text-sm space-y-2">
                <li><Link to="/privacy"><a className="hover:text-[#FFB800] transition-all">Privacy</a></Link></li>
                <li><Link to="/terms"><a className="hover:text-[#FFB800] transition-all">Terms</a></Link></li>
                <li><Link to="/security"><a className="hover:text-[#FFB800] transition-all">Security</a></Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-[#2D2D3A] flex flex-col md:flex-row md:justify-between md:items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} DealFlip. All rights reserved.</p>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-[#FFB800] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FFB800] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.19 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FFB800] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-[#FFB800] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
