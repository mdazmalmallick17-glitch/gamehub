import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "@/lib/api";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/game/GameCard";
import { Download } from "lucide-react";

export default function DeveloperProfile() {
  const [match, params] = useRoute("/developer/:id");
  const [, setLocation] = useLocation();

  const { data: allGames = [], isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: () => gamesApi.getAll(),
  });

  if (!match || !params?.id) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Developer not found</p>
          <Button onClick={() => setLocation("/")} className="mt-4" data-testid="button-back">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Filter games by developer ID
  const developerGames = allGames.filter(
    (game: any) => game.developerId === params.id && game.status === "approved"
  );

  const developer = developerGames[0]?.developer || "Unknown Developer";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />

      {/* Developer Header */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-b border-white/10 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 neon-text">
            {developer}
          </h1>
          <p className="text-muted-foreground">
            {developerGames.length} game{developerGames.length !== 1 ? "s" : ""} published
          </p>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-white/10 mt-4"
            data-testid="button-back"
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-white/5" />
            ))}
          </div>
        ) : developerGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {developerGames.map((game: any) => (
              <GameCard key={game.id} game={game} data-testid={`game-card-${game.id}`} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No published games from this developer yet.
            </p>
            <Button onClick={() => setLocation("/")} data-testid="button-browse-games">
              Browse All Games
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
