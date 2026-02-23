
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, Loader2, Sparkles, AlertCircle, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CarCard } from '@/components/car-card';
import { MOCK_CARS, CarListing } from '@/lib/mock-data';
import { naturalLanguageCarSearch, NaturalLanguageCarSearchOutput } from '@/ai/flows/natural-language-car-search';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function SearchResults() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CarListing[]>(MOCK_CARS);
  const [structuredQuery, setStructuredQuery] = useState<NaturalLanguageCarSearchOutput | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults(MOCK_CARS);
      setStructuredQuery(null);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Process with AI to get structured filters
      const aiResponse = await naturalLanguageCarSearch({ naturalLanguageDescription: searchTerm });
      setStructuredQuery(aiResponse);

      // 2. Filter mock data based on AI response
      const filtered = MOCK_CARS.filter(car => {
        let match = true;
        
        if (aiResponse.make && aiResponse.make.length > 0) {
          match = match && aiResponse.make.some(m => car.make.toLowerCase().includes(m.toLowerCase()));
        }
        
        if (aiResponse.model && aiResponse.model.length > 0) {
          match = match && aiResponse.model.some(m => car.model.toLowerCase().includes(m.toLowerCase()));
        }

        if (aiResponse.maxPrice) {
          match = match && car.price <= aiResponse.maxPrice;
        }
        if (aiResponse.minPrice) {
          match = match && car.price >= aiResponse.minPrice;
        }
        
        if (aiResponse.bodyType && aiResponse.bodyType.length > 0) {
          match = match && aiResponse.bodyType.some(bt => car.bodyType.toLowerCase().includes(bt.toLowerCase()));
        }

        if (aiResponse.fuelType && aiResponse.fuelType.length > 0) {
          match = match && aiResponse.fuelType.some(ft => car.fuelType.toLowerCase().includes(ft.toLowerCase()));
        }

        if (aiResponse.color && aiResponse.color.length > 0) {
          match = match && aiResponse.color.some(c => car.color.toLowerCase().includes(c.toLowerCase()));
        }

        if (aiResponse.maxMileage) {
          match = match && car.mileage <= aiResponse.maxMileage;
        }

        if (aiResponse.minYear) {
          match = match && car.year >= aiResponse.minYear;
        }
        if (aiResponse.maxYear) {
          match = match && car.year <= aiResponse.maxYear;
        }

        return match;
      });

      // Artificial delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      setResults(filtered);
    } catch (error) {
      console.error('AI search failed', error);
      // Fallback simple search
      setResults(MOCK_CARS.filter(c => 
        `${c.make} ${c.model} ${c.description}`.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-500" />
          <div className="relative flex items-center bg-card rounded-xl border border-border shadow-lg p-2">
            <Sparkles className="ml-4 h-5 w-5 text-accent shrink-0" />
            <Input
              className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg h-12"
              placeholder="Describe your perfect car..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit" disabled={isLoading} className="h-10 px-6 font-bold">
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Search"}
            </Button>
          </div>
        </form>

        {structuredQuery && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Filters:</span>
              {structuredQuery.make?.map(m => <Badge key={m} variant="secondary" className="bg-primary/10 text-primary">{m}</Badge>)}
              {structuredQuery.model?.map(m => <Badge key={m} variant="secondary" className="bg-primary/5 text-primary border-primary/20">{m}</Badge>)}
              {structuredQuery.maxPrice && <Badge variant="secondary" className="bg-accent/10 text-accent">Under ${structuredQuery.maxPrice.toLocaleString()}</Badge>}
              {structuredQuery.bodyType?.map(bt => <Badge key={bt} variant="secondary">{bt}</Badge>)}
              {structuredQuery.color?.map(c => <Badge key={c} variant="outline" className="capitalize">{c}</Badge>)}
              {structuredQuery.features?.slice(0, 3).map(f => <Badge key={f} variant="outline" className="border-accent/30 text-accent">{f}</Badge>)}
            </div>

            <Collapsible open={showRawJson} onOpenChange={setShowRawJson} className="bg-secondary/20 rounded-xl border border-border overflow-hidden">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex items-center justify-between px-4 py-2 hover:bg-secondary/40 text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Code className="h-3.5 w-3.5" />
                    DEBUG: VIEW RAW AI RESPONSE & RESULTS (JSON)
                  </div>
                  <span>{showRawJson ? 'Hide' : 'Show'}</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-background/50 border-t border-border">
                  <pre className="text-[10px] font-mono overflow-auto max-h-60 p-2 leading-relaxed">
                    {JSON.stringify({
                      aiInterpretation: structuredQuery,
                      matchingCars: results.map(car => ({
                        id: car.id,
                        name: `${car.make} ${car.model}`,
                        year: car.year,
                        price: car.price
                      }))
                    }, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:block w-64 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            <Button variant="ghost" size="sm" onClick={() => { setResults(MOCK_CARS); setQuery(''); setStructuredQuery(null); }}>
              Reset
            </Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold mb-3 block">Price Range</label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => performSearch("under $20,000")}>Under $20,000</Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => performSearch("$20,000 to $50,000")}>$20,000 - $50,000</Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => performSearch("above $50,000")}>Above $50,000</Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-bold mb-3 block">Body Type</label>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => performSearch("Sedan")}>Sedan</Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => performSearch("SUV")}>SUV</Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-xs" onClick={() => performSearch("Truck")}>Truck</Button>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="text-foreground font-bold">{results.length}</span> matches
            </p>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Sort: Relevant
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-[250px] w-full rounded-xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {results.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
              <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-2">No cars found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any cars matching your description. Try broadening your search or describing different features.
              </p>
              <Button variant="link" className="mt-4" onClick={() => { setResults(MOCK_CARS); setQuery(''); setStructuredQuery(null); }}>
                Show all available cars
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>}>
      <SearchResults />
    </Suspense>
  );
}
