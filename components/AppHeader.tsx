'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { TipChainLogo } from '@/components/TipChainLogo'
import { Home, Users, Trophy, LayoutDashboard, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppHeader() {
  const { isConnected } = useAccount()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fix hydration mismatch by only rendering wallet-dependent content after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      showAlways: true
    },
    {
      href: '/creators',
      label: 'Creators',
      icon: Users,
      showAlways: true
    },
    {
      href: '/leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      showAlways: true
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      showAlways: false // Only show when connected
    }
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const getVisibleNavItems = () => {
    if (!mounted) {
      // Before hydration, only show items that are always visible
      return navItems.filter(item => item.showAlways)
    }
    // After hydration, show based on connection state
    return navItems.filter(item => item.showAlways || (isConnected && item.href === '/dashboard'))
  }

  return (
    <>
      <header className="px-4 py-3 md:px-6 md:py-4 flex justify-between items-center border-b border-gray-800 bg-black/90 backdrop-blur-md sticky top-0 z-50 w-full">
        <Link href="/" className="block z-10">
          <TipChainLogo size={32} showText={true} className="md:w-10 md:h-10" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {getVisibleNavItems().map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`text-white hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200 ${
                    active ? 'text-primary-400 bg-primary-500/20' : ''
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
          
          <div className="ml-4">
            <ConnectButton />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center space-x-2 z-10">
          <div className="scale-90">
            <ConnectButton />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-primary-500 p-2 min-h-[44px] min-w-[44px]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay - Fixed positioning */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden mobile-menu-backdrop fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu */}
          <div className="md:hidden mobile-menu-overlay fixed top-[73px] left-0 right-0 bg-black/95 backdrop-blur-md border-b border-gray-800 shadow-2xl">
            <nav className="flex flex-col p-4 space-y-1 max-h-[calc(100vh-73px)] overflow-y-auto">
              {getVisibleNavItems().map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)

                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-white hover:text-primary-500 hover:bg-primary-500/10 transition-all duration-200 min-h-[48px] ${
                        active ? 'text-primary-400 bg-primary-500/20' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="text-base">{item.label}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}
    </>
  )
}