
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Car, Info, ChevronRight, Lightbulb, Database, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { ref, get, child } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { useFirebaseApp } from '@/firebase';
import { CarCard } from '@/components/car-card';
import { CarListing } from '@/lib/mock-data';

interface RealtimeDbCar {
  id: string;
  carCompany: string[];
  carModel: string[];
  carYear: number[];
  area?: string;
  userId?: string;
}

interface Recommendation {
  make: string;
  model: string;
  reasoning: string;
  category: string;
}

export default function MarketAdvisorPage() {
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [dbMatches, setDbMatches] = useState<RealtimeDbCar[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const firebaseApp = useFirebaseApp();
  const database = getDatabase(firebaseApp);

  const handleGetRecommendations = async () => {
    if (!queryInput.trim()) {
      toast({ title: "Please describe what you're looking for", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);
    setDbMatches([]);
    setLastError(null);
    try {
      const response = await fetch('/api/market-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      setRecommendations(data.recommendations || []);
    } catch (error: any) {
      console.error(error);
      setLastError(error.message);
      toast({ 
        title: "AI Analysis Failed", 
        description: error.message || "Could not get recommendations.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchInDatabase = async () => {
    if (recommendations.length === 0) return;
    
    setIsSearchingDb(true);
    try {
      // Read from Realtime Database - "sell" collection
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, 'carRequests/sell'));
      
      if (!snapshot.exists()) {
        toast({ 
          title: "No cars in database", 
          description: "The database is empty.",
          variant: "default" 
        });
        setIsSearchingDb(false);
        return;
      }

      // Parse the nested structure: sell/{userId}/{carId}
      const allCars: RealtimeDbCar[] = [];
      const sellData = snapshot.val();
      
      for (const userId of Object.keys(sellData)) {
        const userCars = sellData[userId];
        for (const carId of Object.keys(userCars)) {
          const carData = userCars[carId];
          allCars.push({
            id: carId,
            carCompany: carData.carCompany || [],
            carModel: carData.carModel || [],
            carYear: carData.carYear || [],
            area: carData.area,
            userId: userId,
          });
        }
      }

      if (allCars.length === 0) {
        toast({ 
          title: "No cars in database", 
          description: "The database is empty.",
          variant: "default" 
        });
        setIsSearchingDb(false);
        return;
      }

      // Use AI semantic matching to handle Hebrew/English differences
      const response = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendations: recommendations.map(r => ({ make: r.make, model: r.model })),
          availableCars: allCars.map(c => ({ 
            id: c.id, 
            make: c.carCompany.join(' '), 
            model: c.carModel.join(' '),
            description: `${c.carCompany.join(' ')} ${c.carModel.join(' ')} ${c.carYear.join(' ')} ${c.area || ''}`
          })),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Semantic search failed');
      }

      const matchedIds = data.matchedIds || [];
      const filtered = allCars.filter(car => matchedIds.includes(car.id));
      
      setDbMatches(filtered);
      
      if (filtered.length === 0) {
        toast({ 
          title: "No matches in stock", 
          description: "We identified these models, but they aren't in our current database listings.",
          variant: "default" 
        });
      } else {
        toast({ 
          title: `Found ${filtered.length} matching cars!`, 
          description: "Scroll down to see the available listings." 
        });
      }
    } catch (error: any) {
      console.error("Database search error:", error);
      toast({ title: "Error searching database", description: error.message, variant: "destructive" });
    } finally {
      setIsSearchingDb(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary font-bold px-4 py-1 border-none rounded-full">
            Israeli Market Expert
          </Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-primary">Car Market Advisor</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Describe your lifestyle and needs. Our AI consultant will suggest the best makes and models available in the Israeli market.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-border shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" /> What do you need?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Textarea
                  placeholder="e.g., I need a reliable SUV for a family of 5, mostly city driving, high resale value is important."
                  className="min-h-[150px] resize-none border-border focus:ring-primary"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                />
                
                {lastError && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-xl flex items-start gap-2 text-xs font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Error: {lastError}. Check your GOOGLE_GENAI_API_KEY.</span>
                  </div>
                )}

                <Button 
                  onClick={handleGetRecommendations} 
                  disabled={isLoading}
                  className="w-full h-12 font-bold bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Consulting AI...
                    </>
                  ) : "Get Recommendations"}
                </Button>

                {recommendations.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={handleSearchInDatabase} 
                    disabled={isSearchingDb}
                    className="w-full h-12 font-bold border-accent text-accent hover:bg-accent/5"
                  >
                    {isSearchingDb ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching Inventory...
                      </>
                    ) : (
                      <>
                        <Database className="mr-2 h-4 w-4" />
                        Search these in our Database
                      </>
                    )}
                  </Button>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Low maintenance", "Electric SUVs", "Best for students", "7-seaters"].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQueryInput(prev => prev ? `${prev}, ${tag.toLowerCase()}` : tag)}
                        className="text-[10px] font-bold px-2 py-1 bg-secondary rounded-md hover:bg-primary/10 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-accent/5 rounded-2xl p-6 border border-accent/10">
              <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" /> Why use the Advisor?
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Israeli car market is unique. We take into account resale value (Levi Itzhak), local reliability records, and official importer availability.
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-accent animate-pulse" />
                </div>
                <h3 className="text-xl font-bold mb-2">Analyzing the Israeli Market...</h3>
                <p className="text-muted-foreground">Finding the perfect matches for your requirements.</p>
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                <section className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-headline font-bold text-xl">Top Market Recommendations</h3>
                    <span className="text-xs font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                      {recommendations.length} Suggestions
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {recommendations.map((rec, index) => (
                      <Card key={index} className="group hover:border-primary/50 transition-all border-border shadow-sm overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                          <div className="bg-primary/5 p-6 flex items-center justify-center md:w-32">
                            <Car className="h-10 w-10 text-primary group-hover:scale-110 transition-transform" />
                          </div>
                          <CardContent className="p-6 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                              <h4 className="text-xl font-bold text-primary">
                                {rec.make} <span className="text-foreground">{rec.model}</span>
                              </h4>
                              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                                {rec.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {rec.reasoning}
                            </p>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>

                {dbMatches.length > 0 && (
                  <section className="space-y-6 pt-8 border-t border-border">
                    <div className="flex items-center gap-2">
                      <div className="bg-accent p-2 rounded-lg">
                        <Database className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-headline font-bold text-2xl">Found in Our Inventory</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {dbMatches.map((car) => (
                        <Card key={car.id} className="group hover:border-primary/50 transition-all border-border shadow-sm overflow-hidden">
                          <div className="flex flex-col">
                            <div className="bg-accent/10 p-4 flex items-center justify-center">
                              <Car className="h-12 w-12 text-accent" />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="text-lg font-bold text-primary mb-1">
                                {car.carCompany.join(' ')} {car.carModel.join(' ')}
                              </h4>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                {car.carYear.length > 0 && (
                                  <Badge variant="secondary">{car.carYear.join(', ')}</Badge>
                                )}
                                {car.area && (
                                  <Badge variant="outline">{car.area}</Badge>
                                )}
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/10">
                <div className="bg-background h-16 w-16 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold mb-2">Waiting for your input</h3>
                <p className="text-muted-foreground max-w-xs">
                  Describe what you're looking for on the left to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
