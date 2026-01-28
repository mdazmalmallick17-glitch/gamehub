import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { GameCard } from "@/components/game/GameCard";
import { gamesApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["games", "approved"],
    queryFn: () => gamesApi.getAll("approved"),
  });

  const filteredGames = useMemo(() => {
    if (!searchTerm) return games;
    return games.filter(game =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [games, searchTerm]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold neon-text mb-6">Browse All Games</h1>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
              data-testid="input-search-games"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 bg-white/5" />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-xl" data-testid="text-no-games-found">
            <p className="text-muted-foreground text-lg">No games found.</p>
            {searchTerm && <p className="text-sm text-muted-foreground mt-2">Try a different search term.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
