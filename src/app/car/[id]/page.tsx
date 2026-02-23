
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, Share2, Heart, ShieldCheck, MapPin, BadgeCheck, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MOCK_CARS } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const car = MOCK_CARS.find(c => c.id === id);

  if (!car) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-3xl font-headline font-bold mb-4">Car not found</h1>
        <Button onClick={() => router.push('/search')}>Back to Search</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <Button 
        variant="ghost" 
        className="mb-8 gap-2 hover:bg-secondary" 
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-4 w-4" /> Back to listings
      </Button>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Gallery and Main Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src={car.imageUrl}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover"
              priority
              data-ai-hint={`${car.make} ${car.model}`}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer transition-all">
                <Image
                  src={`https://picsum.photos/seed/car-detail-${i}/${400}/${400}`}
                  alt="detail"
                  fill
                  className="object-cover"
                  data-ai-hint="car detail"
                />
              </div>
            ))}
          </div>

          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-headline font-bold text-primary">
                    {car.year} {car.make} {car.model}
                  </h1>
                  <Badge variant="secondary" className="bg-accent/10 text-accent font-bold">New Arrival</Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> San Francisco, CA • Posted 2 days ago
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Mileage</p>
                <p className="font-bold text-lg">{car.mileage.toLocaleString()} mi</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Fuel Type</p>
                <p className="font-bold text-lg">{car.fuelType}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Transmission</p>
                <p className="font-bold text-lg">Automatic</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Condition</p>
                <p className="font-bold text-lg">Excellent</p>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="space-y-4">
              <h2 className="text-xl font-headline font-bold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {car.description} This vehicle has been meticulously maintained and comes with a full service history. 
                Equipped with the latest technology packages and safety features, it offers an unparalleled driving experience. 
                Perfect for anyone looking for reliability without compromising on style.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-headline font-bold">Key Features</h2>
              <div className="flex flex-wrap gap-2">
                {car.features.map(feature => (
                  <Badge key={feature} variant="secondary" className="px-3 py-1 bg-secondary text-primary font-medium">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <Card className="border-border shadow-xl rounded-3xl overflow-hidden sticky top-24">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-muted-foreground">Price</span>
                <span className="text-4xl font-headline font-bold text-primary">${car.price.toLocaleString()}</span>
                <span className="text-xs text-green-600 font-bold mt-1">Excellent Value • Below Market</span>
              </div>

              <div className="space-y-3">
                <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-lg font-bold">
                  Schedule Test Drive
                </Button>
                <Button variant="outline" className="w-full h-12 text-lg font-bold border-accent text-accent hover:bg-accent/10">
                  Negotiate Price
                </Button>
              </div>

              <div className="bg-secondary/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">Safe Transaction</p>
                  <p className="text-xs text-muted-foreground">Protected by One-Click Secure Pay</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">JD</div>
                  <div>
                    <p className="font-bold text-sm flex items-center gap-1">John Doe <BadgeCheck className="h-3.5 w-3.5 text-blue-500" /></p>
                    <p className="text-xs text-muted-foreground">Private Seller • Joined 2021</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Phone className="h-3.5 w-3.5" /> Call
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-primary p-6 rounded-3xl text-primary-foreground">
            <h4 className="font-headline font-bold mb-2">Want a similar car?</h4>
            <p className="text-sm text-primary-foreground/80 mb-4">Tell us your budget and we'll notify you when a match arrives.</p>
            <Button variant="secondary" className="w-full text-primary font-bold">Create Alert</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
