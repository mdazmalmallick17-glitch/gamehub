import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "@/lib/api";
import { GameCard } from "@/components/game/GameCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { EditProfileDialog } from "./edit-profile";

export default function ProfilePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [editOpen, setEditOpen] = useState(false);

  const { data: allGames = [], isLoading } = useQuery({
    queryKey: ["games"],
    queryFn: () => gamesApi.getAll(),
    enabled: !!user,
  });

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const myGames = allGames.filter(g => g.developerId === user.id);
  const pendingGames = myGames.filter(g => g.status === "pending");
  const approvedGames = myGames.filter(g => g.status === "approved");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="h-60 bg-gradient-to-r from-primary/20 to-secondary/20 relative">
        <div className="absolute -bottom-16 left-0 w-full container mx-auto px-4 flex items-end">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-background">
              <Avatar className="w-full h-full" data-testid="avatar-profile">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute bottom-0 right-0 rounded-full w-8 h-8"
              onClick={() => setEditOpen(true)}
              data-testid="button-edit-avatar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-4 ml-4 flex-1">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2" data-testid="text-username">
              {user.username.split('@')[0]}
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/30 uppercase">
                {user.role}
              </span>
            </h1>
            <p className="text-gray-400" data-testid="text-bio">{user.bio || "No bio yet."}</p>
          </div>
          <div className="mb-4 hidden md:block">
            <Button 
              variant="outline" 
              className="border-white/10 bg-black/50"
              onClick={() => setEditOpen(true)}
              data-testid="button-edit-profile"
            >
              <Settings className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-24">
        <Tabs defaultValue="my-games" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="my-games" data-testid="tab-my-games">My Games ({myGames.length})</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending ({pendingGames.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-games">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-80 bg-white/5" />
                ))}
              </div>
            ) : myGames.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {approvedGames.map(game => (
                    <div key={game.id} className="relative group">
                      <GameCard game={game} />
                      <Button 
                        size="sm"
                        onClick={() => setLocation(`/game/${game.id}/edit`)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-edit-game-${game.id}`}
                      >
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl">
                <p className="text-muted-foreground mb-4">You haven't uploaded any games yet.</p>
                <Button onClick={() => setLocation('/upload')} data-testid="button-upload-first">Upload Your First Game</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-80 bg-white/5" />
                ))}
              </div>
            ) : pendingGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pendingGames.map(game => <GameCard key={game.id} game={game} />)}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-white/10 rounded-xl" data-testid="text-no-pending">
                <p className="text-muted-foreground">No games pending approval.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EditProfileDialog open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
