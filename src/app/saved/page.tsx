
'use client';

import { Heart, Search, CarFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CarCard } from '@/components/car-card';
import { MOCK_CARS } from '@/lib/mock-data';
import Link from 'next/link';

export default function SavedPage() {
  // Simulating saved items
  const savedItems = MOCK_CARS.slice(0, 2);

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold text-primary">My Garage</h1>
          <p className="text-muted-foreground">Review your saved cars and past AI searches.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" /> Past Searches
          </Button>
        </div>
      </div>

      {savedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {savedItems.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
          <div className="border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-secondary/10 group hover:bg-secondary/20 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <CarFront className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold mb-1">Add More</h3>
            <p className="text-xs text-muted-foreground mb-4">Keep track of cars you're interested in.</p>
            <Button size="sm" variant="secondary" asChild>
              <Link href="/search">Browse Marketplace</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-24 text-center">
          <div className="bg-secondary/30 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-headline font-bold mb-2">No saved cars yet</h2>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Click the heart icon on any listing to save it here for later review.
          </p>
          <Button asChild className="bg-primary hover:bg-primary/90 font-bold px-8 h-12">
            <Link href="/search">Start Searching</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
