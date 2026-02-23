
'use client';

import { useState } from 'react';
import { Sparkles, Camera, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateAIListedCarDescription, AIListedCarDescriptionGenerationOutput } from '@/ai/flows/ai-listed-car-description-generation';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SellCarPage() {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIListedCarDescriptionGenerationOutput | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ title: "Please enter a description", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAIListedCarDescription({ freeformDescription: description });
      setAiResult(result);
      toast({ title: "AI Listing Generated!", description: "Review and publish your car." });
    } catch (error) {
      console.error(error);
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-accent/20 text-accent font-bold px-4 py-1 border-none rounded-full">
            Sell Your Vehicle
          </Badge>
          <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">List your car in seconds.</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Just describe your car in your own words. Our AI will handle the technical specs and write a professional listing description for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <Card className="border-border shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-border p-8">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" /> AI Listing Assistant
                </CardTitle>
                <CardDescription>Enter details like: Year, Make, Model, Mileage, and any special features.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-bold">Your Car's Story</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., I'm selling my 2018 Honda Civic. It has 45k miles, runs perfectly. Silver color, minor scratch on front bumper. Recently serviced, new tires."
                    className="min-h-[200px] text-base p-4 rounded-xl border-border focus:ring-primary focus:border-primary"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-bold text-muted-foreground">Upload Photos</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 opacity-50 cursor-not-allowed">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-bold text-muted-foreground">Vehicle Report (Soon)</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating} 
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 rounded-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Crafting your listing...
                    </>
                  ) : "Generate AI Listing"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-accent/10 rounded-3xl p-8 border border-accent/20">
              <h3 className="font-headline font-bold text-xl mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" /> Why sell with AI?
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] text-white font-bold">1</span>
                  </div>
                  <p className="text-sm font-medium">Professional copywriting designed to convert.</p>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] text-white font-bold">2</span>
                  </div>
                  <p className="text-sm font-medium">Automatic extraction of technical specifications.</p>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mt-0.5">
                    <span className="text-[10px] text-white font-bold">3</span>
                  </div>
                  <p className="text-sm font-medium">Suggested pricing based on current market data.</p>
                </li>
              </ul>
            </div>

            {aiResult && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <Card className="border-accent shadow-xl bg-card rounded-3xl overflow-hidden ring-4 ring-accent/5">
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="font-headline font-bold text-primary">Generated Listing</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-secondary rounded-lg">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Car</p>
                        <p className="text-sm font-bold">{aiResult.year} {aiResult.make} {aiResult.model}</p>
                      </div>
                      <div className="p-2 bg-secondary rounded-lg">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Condition</p>
                        <p className="text-sm font-bold">{aiResult.condition}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Description preview</p>
                      <p className="text-xs text-muted-foreground italic line-clamp-4">"{aiResult.listingDescription}"</p>
                    </div>
                    <Button className="w-full bg-accent hover:bg-accent/90 font-bold">Review & Post Listing</Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
