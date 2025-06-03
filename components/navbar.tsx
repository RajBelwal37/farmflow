"use client"

import { MoonIcon, SunIcon, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sprout } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const { setTheme } = useTheme()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  const NavItems = () => (
    <>
      <Link 
        href="/dashboard" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
        onClick={() => setIsOpen(false)}
      >
        Dashboard
      </Link>
      <Link 
        href="/crops" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/crops')}`}
        onClick={() => setIsOpen(false)}
      >
        Crops
      </Link>
      <Link 
        href="/livestock" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/livestock')}`}
        onClick={() => setIsOpen(false)}
      >
        Livestock
      </Link>
      <Link 
        href="/inventory" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/inventory')}`}
        onClick={() => setIsOpen(false)}
      >
        Inventory
      </Link>
      <Link 
        href="/weather" 
        className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/weather')}`}
        onClick={() => setIsOpen(false)}
      >
        Weather
      </Link>
    </>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center flex-1">
          {/* Left section: Logo and Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Sprout className="h-6 w-6" />
              <span className="font-bold hidden md:inline">FarmFlow</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
              {session?.user && <NavItems />}
            </nav>

            {/* Mobile Navigation */}
            {session?.user && (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden ml-4">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                  <nav className="flex flex-col space-y-4 mt-6">
                    <NavItems />
                  </nav>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {/* Right section: Theme and Auth */}
          <div className="flex items-center space-x-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {status === 'loading' ? (
              <div className="text-gray-300">Loading...</div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden sm:inline text-gray-300">{session.user.name || session.user.email}</span>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}