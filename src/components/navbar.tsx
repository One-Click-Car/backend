'use client';

import Link from 'next/link';
import { Car, Search, PlusCircle, Heart, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tight text-primary">
                One-Click-Car <span className="text-accent">AI</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/market-advisor" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              Market Advisor <Badge variant="secondary" className="px-1.5 py-0 text-[10px] bg-accent/20 text-accent border-none">AI</Badge>
            </Link>
            <Link href="/sell" className="text-sm font-medium hover:text-primary transition-colors">
              Sell a Car
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/saved">
              <Button variant="ghost" size="icon" className="hover:text-accent">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="default" className="bg-primary hover:bg-primary/90 hidden sm:flex">
              Sign In
            </Button>
            <Button variant="outline" size="icon" className="md:hidden">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { Badge } from '@/components/ui/badge';
