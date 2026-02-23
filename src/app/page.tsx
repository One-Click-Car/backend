
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CarCard } from '@/components/car-card';
import { MOCK_CARS } from '@/lib/mock-data';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" 
            style={{ mixBlendMode: 'overlay' }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Badge variant="secondary" className="mb-6 px-3 py-1 bg-accent/20 text-accent font-semibold border-none rounded-full flex w-fit items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Search
            </Badge>
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-primary leading-[1.1] mb-6">
              Find your next car in <span className="text-accent italic">plain English.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              No more complex filters. Just describe what you're looking for, and let our AI find the perfect match from thousands of listings.
            </p>

            <form onSubmit={handleSearch} className="relative group max-w-2xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative flex items-center bg-card rounded-xl border border-border shadow-2xl p-2 transition-all duration-300">
                <Search className="ml-4 h-6 w-6 text-muted-foreground shrink-0" />
                <Input
                  className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg h-14 placeholder:text-muted-foreground/50"
                  placeholder='Try: "A fuel-efficient family SUV under $40k with low miles"'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-lg font-bold"
                >
                  Search
                </Button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="text-sm font-medium text-muted-foreground pt-1">Popular:</span>
              <button onClick={() => setSearchQuery('Reliable sedan under $25k')} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 transition-colors border border-border/50 text-primary">Reliable sedan under $25k</button>
              <button onClick={() => setSearchQuery('Luxury SUV for a large family')} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 transition-colors border border-border/50 text-primary">Luxury SUV for a family</button>
              <button onClick={() => setSearchQuery('Electric car with long range')} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 transition-colors border border-border/50 text-primary">Electric car long range</button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4 p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-headline font-bold text-xl">Instant Matching</h3>
              <p className="text-muted-foreground">Our AI understands context, not just keywords. Describe your lifestyle and we'll find the car that fits.</p>
            </div>
            <div className="flex flex-col gap-4 p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-headline font-bold text-xl">Verified Listings</h3>
              <p className="text-muted-foreground">Every car on One-Click-Car AI goes through a rigorous data verification process for your peace of mind.</p>
            </div>
            <div className="flex flex-col gap-4 p-8 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-secondary-foreground/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-headline font-bold text-xl">Market Analysis</h3>
              <p className="text-muted-foreground">Get real-time price comparisons and historical data to ensure you're getting a fair market deal.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-bold">Featured Listings</h2>
              <p className="text-muted-foreground">Handpicked high-quality vehicles just for you.</p>
            </div>
            <Button variant="link" className="text-primary font-bold group" asChild>
              <Link href="/search">
                Browse all cars <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_CARS.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
