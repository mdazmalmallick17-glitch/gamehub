import { useState } from "react";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesApi, adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, Gamepad, Download, Video, Flag, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [gameToDelete, setGameToDelete] = useState<any>(null);
  const [displayedGames, setDisplayedGames] = useState<any[]>([]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats(),
    enabled: !!user && user.role === "admin",
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
    enabled: !!user && user.role === "admin",
  });

  const { data: allGames = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["games"],
    queryFn: () => gamesApi.getAll(),
    enabled: !!user && user.role === "admin",
  });

  // Sync displayed games when allGames changes
  React.useEffect(() => {
    setDisplayedGames(allGames);
  }, [allGames]);

  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminApi.getReports(),
    enabled: !!user && user.role === "admin",
  });

  const banMutation = useMutation({
    mutationFn: (data: { userId: string; banned: boolean }) =>
      adminApi.updateUser(data.userId, { banned: data.banned } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User status updated" });
    },
  });

  const featureUserMutation = useMutation({
    mutationFn: (data: { userId: string; featured: boolean }) =>
      adminApi.updateUser(data.userId, { featured: data.featured } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User featured status updated" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (gameId: string) => gamesApi.update(gameId, { status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game approved" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (gameId: string) => gamesApi.delete(gameId),
    onSuccess: () => {
      // Remove from displayed list immediately
      setDisplayedGames(prev => prev.filter(g => g.id !== gameToDelete?.id));
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game deleted successfully", description: "The game has been permanently removed" });
      setGameToDelete(null);
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive", 
        title: "Failed to delete game", 
        description: error.message 
      });
    },
  });

  const featureGameMutation = useMutation({
    mutationFn: ({ gameId, featured }: { gameId: string; featured: boolean }) => 
      gamesApi.update(gameId, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game featured status updated" });
    },
  });

  const setFeaturedVideoMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/featured-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl, title: videoTitle }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to set video");
      return res.json();
    },
    onSuccess: () => {
      setYoutubeUrl("");
      setVideoTitle("");
      toast({ title: "Featured video updated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Failed", description: error.message });
    },
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <Button onClick={() => setLocation("/")} className="mt-4">Go Home</Button>
      </div>
    );
  }

  const pendingGames = allGames.filter(g => g.status === "pending");
  const approvedGames = allGames.filter(g => g.status === "approved");

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display font-bold neon-text mb-8">Admin Dashboard</h1>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.totalGames}</div>
                <div className="text-sm text-muted-foreground">Total Games</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.totalDownloads}</div>
                <div className="text-sm text-muted-foreground">Total Downloads</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">{stats.avgRating}</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 flex flex-wrap">
            <TabsTrigger value="users" data-testid="tab-users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="games" data-testid="tab-games"><Gamepad className="mr-2 h-4 w-4" />Games</TabsTrigger>
            <TabsTrigger value="video" data-testid="tab-video"><Video className="mr-2 h-4 w-4" />Video</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports"><Flag className="mr-2 h-4 w-4" />Reports ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <Skeleton className="h-40 bg-white/5" />
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allUsers.map((u: any) => (
                      <div key={u.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10" data-testid={`user-row-${u.id}`}>
                        <div className="flex-1">
                          <div className="font-medium">{u.username}</div>
                          <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                            {u.banned && <Badge variant="destructive">Banned</Badge>}
                            {u.featured && <Badge variant="secondary">Featured</Badge>}
                            {u.role === "admin" && <Badge>Admin</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={u.banned ? "outline" : "destructive"}
                            onClick={() => banMutation.mutate({ userId: u.id, banned: !u.banned })}
                            data-testid={`button-ban-${u.id}`}
                            disabled={u.role === "admin"}
                          >
                            {u.banned ? "Unban" : "Ban"}
                          </Button>
                          <Button
                            size="sm"
                            variant={u.featured ? "default" : "outline"}
                            onClick={() => featureUserMutation.mutate({ userId: u.id, featured: !u.featured })}
                            data-testid={`button-feature-${u.id}`}
                          >
                            {u.featured ? "★" : "☆"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="games">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle>Game Moderation ({pendingGames.length} Pending • {approvedGames.length} Approved)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {gamesLoading ? (
                  <Skeleton className="h-40 bg-white/5" />
                ) : displayedGames.length > 0 ? (
                  <>
                    {pendingGames.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-yellow-400">⏳ Pending Approval ({pendingGames.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {pendingGames.map((game: any) => (
                            <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-yellow-500/20" data-testid={`game-row-${game.id}`}>
                              <div className="flex-1">
                                <div className="font-medium">{game.title}</div>
                                <div className="text-sm text-muted-foreground">by {game.developer}</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => approveMutation.mutate(game.id)}
                                  data-testid={`button-approve-${game.id}`}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setGameToDelete(game)}
                                  data-testid={`button-delete-${game.id}`}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {approvedGames.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-green-400">✓ Approved Games ({approvedGames.length})</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {approvedGames.map((game: any) => (
                            <div key={game.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-green-500/20" data-testid={`game-row-approved-${game.id}`}>
                              <div className="flex-1">
                                <div className="font-medium">{game.title}</div>
                                <div className="text-sm text-muted-foreground">by {game.developer} • {game.views} views</div>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setGameToDelete(game)}
                                data-testid={`button-delete-approved-${game.id}`}
                              >
                                Delete
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">No games found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle>Set Featured Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">YouTube URL</label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="mt-2 bg-white/5 border-white/10"
                    data-testid="input-youtube-url"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Video Title</label>
                  <Input
                    placeholder="Featured Showcase"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="mt-2 bg-white/5 border-white/10"
                    data-testid="input-video-title"
                  />
                </div>
                <Button
                  onClick={() => setFeaturedVideoMutation.mutate()}
                  disabled={!youtubeUrl || setFeaturedVideoMutation.isPending}
                  className="w-full"
                  data-testid="button-set-featured"
                >
                  {setFeaturedVideoMutation.isPending ? "Updating..." : "Set Featured Video"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-card/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Game Reports Inbox ({reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reportsLoading ? (
                  <Skeleton className="h-40 bg-white/5" />
                ) : reports.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {reports.map((report: any) => (
                      <div key={report.id} className="p-4 bg-white/5 rounded-lg border border-red-500/20 space-y-2" data-testid={`report-row-${report.id}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-red-400">Game ID: {report.gameId}</p>
                            <p className="text-sm text-muted-foreground">Reported by: {report.userId}</p>
                          </div>
                          <Badge variant="secondary">{report.reason}</Badge>
                        </div>
                        <p className="text-sm bg-black/50 p-2 rounded italic border border-white/5">"{report.message || 'No message provided'}"</p>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-white/10"
                            data-testid={`button-delete-report-${report.id}`}
                            onClick={() => {
                              toast({ title: "Report marked as resolved" });
                            }}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reports yet. All clear!</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!gameToDelete} onOpenChange={(open) => !open && setGameToDelete(null)}>
          <AlertDialogContent className="bg-background border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Delete Game Permanently?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/70">
                You are about to permanently delete "<span className="font-semibold text-white">{gameToDelete?.title}</span>".
                <br />
                This action cannot be undone. All associated files (thumbnail, screenshots) will be removed from the server.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="bg-white/5 p-3 rounded border border-red-500/20 text-sm text-red-300">
              ⚠️ This will remove the game from the entire platform immediately.
            </div>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => deleteMutation.mutate(gameToDelete?.id)}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
