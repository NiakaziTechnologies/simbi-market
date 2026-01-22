// @ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF0F1] via-white to-[#ECF0F1] relative overflow-hidden">
      {/* Metis background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-[#3498DB]/20 to-[#2ECC71]/20 rounded-full blur-3xl animate-luxury-float"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-br from-[#2ECC71]/20 to-[#3498DB]/20 rounded-full blur-3xl animate-luxury-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#3498DB]/15 to-[#2ECC71]/15 rounded-full blur-3xl animate-luxury-float" style={{ animationDelay: '4s' }}></div>
      </div>
      {/* Navigation */}
      <nav className="relative z-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#3498DB] to-[#2ECC71] rounded-xl flex items-center justify-center shadow-xl luxury-hover-lift">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-[#3498DB] to-gray-900 bg-clip-text text-transparent">Carspian Seller</h2>
              <p className="text-sm text-gray-600 font-medium">ERP Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-[#3498DB] to-[#2ECC71] hover:from-[#2980B9] hover:to-[#27AE60] text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-[#3498DB] to-[#2ECC71] hover:from-[#2980B9] hover:to-[#27AE60] text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-luxury-fade-in-up">
              <span className="block">Sell Auto Parts</span>
              
            </h1>

            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed font-light animate-luxury-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Join thousands of successful sellers on the automotive marketplace.
              Our intelligent platform combines cutting-edge technology with elegant design to make selling auto parts
              <span className="font-semibold text-gray-800"> simple, fast, and profitable.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-luxury-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-[#3498DB] to-[#2ECC71] hover:from-[#2980B9] hover:to-[#27AE60] text-white px-10 py-5 text-lg font-semibold hover:scale-105 w-full sm:w-auto group relative overflow-hidden shadow-lg">
                  <span className="relative z-10 flex items-center gap-3">
                    Start Selling Today
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-10 py-5 text-lg font-semibold border-2 border-[#3498DB] text-[#3498DB] hover:bg-gradient-to-r hover:from-[#3498DB]/5 hover:to-[#2ECC71]/5 hover:border-[#2ECC71] transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#3498DB] rounded-full"></div>
                <span>10,000+ Active Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#2ECC71] rounded-full"></div>
                <span>1M+ Parts Listed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#3498DB] rounded-full"></div>
                <span>99.9% Uptime</span>
              </div>
            </div>

          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-transparent rounded-full -translate-y-48 translate-x-48 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100 to-transparent rounded-full translate-y-48 -translate-x-48 opacity-50"></div>
      </div>

      {/* Features Section */}
      <div className="py-32 bg-gradient-to-br from-white via-[#ECF0F1]/30 to-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(52,152,219,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(46,204,113,0.05),transparent_50%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-20 animate-luxury-fade-in-up">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to
              <span className="block luxury-gradient-text">
                Excel
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our sophisticated platform combines cutting-edge technology with elegant design,
              providing all the premium tools and features you need to elevate your auto parts business to new heights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center group animate-luxury-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#3498DB] to-[#2ECC71] rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Experience blazing-fast setup with instant listing approval. Our premium platform ensures you start selling within minutes, not hours.</p>
            </div>

            <div className="text-center group animate-luxury-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#2ECC71] to-[#3498DB] rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Analytics</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Harness the power of artificial intelligence with advanced insights and predictive reporting to make data-driven decisions for exponential growth.</p>
            </div>

            <div className="text-center group animate-luxury-fade-in-up" style={{ animationDelay: '1s' }}>
              <div className="w-20 h-20 bg-gradient-to-br from-[#3498DB] via-[#2ECC71] to-[#3498DB] rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Global Elite Network</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Connect with premium buyers worldwide through our exclusive network. Expand your market reach beyond geographical boundaries with sophisticated targeting.</p>
            </div>
          </div>
        </div>
      </div>
   </div>
 );
};

export default LandingPage;