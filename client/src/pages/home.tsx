import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeaturedHero } from "@/components/game/FeaturedHero";
import { GameCard } from "@/components/game/GameCard";
import { gamesApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

function extractVideoId(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games", "approved"],
    queryFn: () => gamesApi.getAll("approved"),
  });

  const { data: featuredVideo } = useQuery({
    queryKey: ["featured-video"],
    queryFn: async () => {
      const res = await fetch("/api/featured-video");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const featuredGame = games.find(g => g.featured) || games[0];
  const topRated = [...games].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const trending = [...games].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-6">
        {/* Featured Section */}
        {isLoading ? (
          <Skeleton className="w-full h-[600px] rounded-2xl mb-12 bg-white/5" />
        ) : featuredGame ? (
          <FeaturedHero game={featuredGame} />
        ) : null}
        
        {/* Featured Video Section */}
        {featuredVideo && (
          <div className="mb-12">
            <h2 className="text-2xl font-display font-bold mb-4">Featured Video</h2>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/10 group cursor-pointer" data-testid="featured-video-section">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${extractVideoId(featuredVideo.youtubeUrl)}`}
                title={featuredVideo.title || "Featured Video"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            {featuredVideo.title && (
              <p className="text-sm text-muted-foreground mt-2">{featuredVideo.title}</p>
            )}
          </div>
        )}

        {/* Browse & Subscribe CTA */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Button 
            onClick={() => setLocation("/browse")}
            variant="outline"
            className="border-white/20 hover:bg-white/10"
            data-testid="button-browse"
          >
            Browse All Games
          </Button>
          <a 
            href="https://youtube.com/@haryscode?si=8oR4hR1xMrE6AimH" 
            target="_blank" 
            rel="noreferrer"
            data-testid="link-subscribe"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white rounded-full font-bold hover:bg-[#cc0000] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Youtube className="h-5 w-5 fill-current" />
            Subscribe to our Channel
          </a>
        </div>

        {/* Game Categories / Sections */}
        <Tabs defaultValue="trending" className="w-full space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white">Discover Games</h2>
            <TabsList className="bg-white/5 border border-white/10 rounded-full p-1">
              <TabsTrigger value="trending" data-testid="tab-trending" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Trending</TabsTrigger>
              <TabsTrigger value="top-rated" data-testid="tab-top-rated" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">Top Rated</TabsTrigger>
              <TabsTrigger value="new" data-testid="tab-new" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white">New Releases</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-80 bg-white/5" />
                ))}
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-xl" data-testid="text-no-games">
                <p className="text-muted-foreground text-lg">No games available yet. Be the first to upload!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trending.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="top-rated" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topRated.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="new" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.slice(0, 8).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </main>
      <Footer />
    </div>
  );
}
