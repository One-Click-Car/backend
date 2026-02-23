
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Fuel, Gauge, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CarListing } from '@/lib/mock-data';

interface CarCardProps {
  car: CarListing;
}

export function CarCard({ car }: CarCardProps) {
  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
      <Link href={`/car/${car.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <Image
          src={car.imageUrl}
          alt={`${car.year} ${car.make} ${car.model}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={`${car.color} ${car.bodyType}`}
        />
        <div className="absolute top-3 right-3">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all"
            onClick={(e) => {
              e.preventDefault();
              // Handle save
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-primary font-bold">
            ${car.price.toLocaleString()}
          </Badge>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">
              {car.make} {car.model}
            </h3>
            <p className="text-sm text-muted-foreground">{car.bodyType} • {car.fuelType}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1 p-2 bg-secondary/30 rounded-lg">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span>{car.year}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-secondary/30 rounded-lg">
            <Gauge className="h-3.5 w-3.5 text-primary" />
            <span>{car.mileage.toLocaleString()} mi</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 bg-secondary/30 rounded-lg">
            <Fuel className="h-3.5 w-3.5 text-primary" />
            <span>{car.fuelType}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild variant="outline" className="w-full font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
          <Link href={`/car/${car.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
