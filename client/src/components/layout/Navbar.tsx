import { User } from "@/lib/types";
import { useState } from "react";
import { Link } from "wouter";

interface NavbarProps {
  user?: User;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1C1C28] text-white px-4 md:px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#FFB800]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8v8H8V8h8m2-2H6v12h12V6z" />
            <path d="M14 2H4v12h2V4h8V2z" />
            <path d="M20 10h-2v8h-8v2h10V10z" />
          </svg>
          <span className="font-display text-xl font-bold tracking-tight">DealFlip</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/">
            <a className="font-medium hover:text-[#FFB800] transition-all">Dashboard</a>
          </Link>
          <Link to="/deals">
            <a className="font-medium hover:text-[#FFB800] transition-all">Deals</a>
          </Link>
          <Link to="/inventory">
            <a className="font-medium hover:text-[#FFB800] transition-all">Inventory</a>
          </Link>
          <Link to="/analytics">
            <a className="font-medium hover:text-[#FFB800] transition-all">Analytics</a>
          </Link>
          <Link to="/settings">
            <a className="font-medium hover:text-[#FFB800] transition-all">Settings</a>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="hidden sm:block bg-[#FFB800] hover:bg-[#E6A600] text-[#1C1C28] font-medium px-4 py-2 rounded-lg transition-all">
            New Deal
          </button>
          
          <div className="relative">
            <button 
              className="flex items-center text-white hover:text-[#FFB800] transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img 
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80"} 
                alt="User avatar" 
                className="h-8 w-8 rounded-full border-2 border-[#FFB800]" 
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link to="/profile">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</a>
                </Link>
                <Link to="/settings">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                </Link>
                <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Sign out
                </button>
              </div>
            )}
          </div>
          
          <button 
            className="md:hidden text-white hover:text-[#FFB800]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-700">
          <div className="flex flex-col space-y-3 px-2">
            <Link to="/">
              <a className="block font-medium hover:text-[#FFB800] transition-all py-2">Dashboard</a>
            </Link>
            <Link to="/deals">
              <a className="block font-medium hover:text-[#FFB800] transition-all py-2">Deals</a>
            </Link>
            <Link to="/inventory">
              <a className="block font-medium hover:text-[#FFB800] transition-all py-2">Inventory</a>
            </Link>
            <Link to="/analytics">
              <a className="block font-medium hover:text-[#FFB800] transition-all py-2">Analytics</a>
            </Link>
            <Link to="/settings">
              <a className="block font-medium hover:text-[#FFB800] transition-all py-2">Settings</a>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
