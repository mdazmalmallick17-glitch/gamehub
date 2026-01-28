import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesApi, reviewsApi, likesApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Download, ThumbsUp, ThumbsDown, Flag, ExternalLink, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function GameDetails() {
  const [match, params] = useRoute("/game/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  
  if (!match || !params) return <div>Game not found</div>;
  
  const { data: game, isLoading } = useQuery({
    queryKey: ["game", params.id],
    queryFn: () => gamesApi.getById(params.id),
    enabled: !!params.id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", params.id],
    queryFn: () => reviewsApi.getByGame(params.id),
    enabled: !!params.id,
  });

  const { data: userLike } = useQuery({
    queryKey: ["like", params.id],
    queryFn: () => likesApi.get(params.id),
    enabled: !!params.id && !!user,
  });

  const downloadMutation = useMutation({
    mutationFn: () => gamesApi.trackDownload(params.id),
    onSuccess: () => {
      if (game?.apkUrl) {
        window.open(game.apkUrl, '_blank');
      }
    },
  });

  const likeMutation = useMutation({
    mutationFn: (isLike: boolean) => likesApi.set(params.id, isLike),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["like", params.id] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create(params.id, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", params.id] });
      queryClient.invalidateQueries({ queryKey: ["game", params.id] });
      setComment("");
      setRating(5);
      toast({
        title: "Review Posted!",
        description: "Thank you for your feedback",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/games/${params.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, message: reportMessage }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to report game");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Our team will review this game shortly.",
      });
      setReportReason("");
      setReportMessage("");
      setReportOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full h-96 bg-white/5" />
        </div>
      </div>
    );
  }

  if (!game) return <div className="p-20 text-white text-center">Game Not Found</div>;

  const likeCount = reviews.filter(r => true).length; // Show review count as engagement

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] w-full overflow-hidden">
        <img 
          src={game.screenshots[0]} 
          alt="Cover" 
          className="w-full h-full object-cover opacity-60 blur-sm" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 z-20 w-full p-4 sm:p-8 container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center md:items-start gap-6"
          >
            <img 
              src={game.thumbnail} 
              alt={game.title} 
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 rounded-2xl shadow-2xl border-2 border-white/10 object-cover game-img"
              onError={(e) => {
                console.log("Thumbnail failed:", game.thumbnail);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="text-center md:text-left">
              <div className="flex gap-2 mb-2 sm:mb-3 flex-wrap justify-center md:justify-start">
                <Badge className="bg-primary text-xs sm:text-sm">{game.category}</Badge>
                {game.featured && <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs sm:text-sm">Featured</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-white mb-1 sm:mb-2 neon-text">{game.title}</h1>
              <p className="text-xs sm:text-base text-gray-300 font-medium">By <span className="text-secondary" data-testid="text-developer">{game.developer}</span></p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center" data-testid="stat-rating">
                <div className="text-2xl font-bold text-primary">{game.rating?.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="h-3 w-3" /> Rating
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center" data-testid="stat-downloads">
                <div className="text-2xl font-bold text-secondary">{(game.downloads || 0).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center" data-testid="stat-reviews">
                <div className="text-2xl font-bold">{reviews.length}</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card/50 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">{game.description}</p>
            </div>

            {/* Screenshots */}
            {game.screenshots.length > 0 && (
              <div className="bg-card/50 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Screenshots ({game.screenshots.length})</h2>
                <p className="text-sm text-muted-foreground mb-4">Click any image to view full size</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {game.screenshots.map((shot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedScreenshot(shot)}
                      className="flex-shrink-0 group relative cursor-pointer transition-transform hover:scale-105"
                      data-testid={`screenshot-${idx}`}
                    >
                      <img 
                        src={shot} 
                        alt={`Screenshot ${idx + 1}`}
                        className="h-32 w-auto rounded-lg border border-white/10 shadow-lg group-hover:shadow-primary/50 transition-all object-contain"
                      />
                      <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">View</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Screenshot Modal */}
            {selectedScreenshot && (
              <Dialog open={!!selectedScreenshot} onOpenChange={(open) => !open && setSelectedScreenshot(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] bg-black/90 border-white/10 p-0 overflow-hidden flex items-center justify-center">
                  <div className="w-full h-full flex items-center justify-center bg-black/95 overflow-auto">
                    <img 
                      src={selectedScreenshot} 
                      alt="Full screenshot"
                      className="max-h-full max-w-full object-contain p-4"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Reviews Section */}
            <div className="bg-card/50 border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
              
              {user ? (
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <Label className="mb-3 block">Your Rating</Label>
                  <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-2xl transition-transform hover:scale-110"
                        data-testid={`star-${star}`}
                      >
                        {star <= rating ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Write your review..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[80px] bg-white/5 border-white/10 mb-3"
                    data-testid="textarea-review"
                  />
                  <Button
                    onClick={() => reviewMutation.mutate()}
                    disabled={!comment || reviewMutation.isPending}
                    className="w-full"
                    data-testid="button-post-review"
                  >
                    Post Review
                  </Button>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-blue-400 text-sm">
                    <Button variant="link" onClick={() => setLocation("/auth")} className="p-0 h-auto">
                      Login
                    </Button>
                    {" "}to leave a review
                  </p>
                </div>
              )}

              <Separator className="my-6" />

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-white/5 rounded-lg border border-white/10" data-testid={`review-${review.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{review.username}</p>
                          <p className="text-sm text-yellow-400">{"⭐".repeat(review.rating)}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Download Button */}
            <Button
              onClick={() => downloadMutation.mutate()}
              className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
              disabled={downloadMutation.isPending}
              data-testid="button-download"
            >
              <Download className="mr-2 h-5 w-5" />
              Download APK
            </Button>

            {/* Visit User Button */}
            <Button
              onClick={() => setLocation(`/developer/${game.developerId}`)}
              variant="outline"
              className="w-full border-secondary/50 hover:border-secondary text-secondary"
              data-testid="button-visit-user"
            >
              <User className="mr-2 h-4 w-4" />
              Visit {game.developer}
            </Button>

            {/* External Link */}
            {game.externalLink && (
              <Button
                variant="outline"
                asChild
                className="w-full border-white/10"
              >
                <a href={game.externalLink} target="_blank" rel="noreferrer" data-testid="link-external">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  External Link
                </a>
              </Button>
            )}

            {/* Like/Dislike */}
            {user && (
              <div className="bg-card/50 border border-white/10 rounded-xl p-4 space-y-3">
                <Label className="text-sm">How do you feel about this game?</Label>
                <div className="flex gap-2">
                  <Button
                    variant={userLike?.isLike ? "default" : "outline"}
                    size="sm"
                    onClick={() => likeMutation.mutate(true)}
                    className="flex-1"
                    data-testid="button-like"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" /> Like
                  </Button>
                  <Button
                    variant={userLike && !userLike.isLike ? "default" : "outline"}
                    size="sm"
                    onClick={() => likeMutation.mutate(false)}
                    className="flex-1"
                    data-testid="button-dislike"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" /> Dislike
                  </Button>
                </div>
              </div>
            )}

            {/* Report Button */}
            <Button
              variant="outline"
              className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
              onClick={() => {
                if (!user) {
                  setLocation("/auth");
                  return;
                }
                setReportOpen(true);
              }}
              data-testid="button-report"
            >
              <Flag className="mr-2 h-4 w-4" />
              Report Game
            </Button>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="bg-black/90 border-white/10">
          <DialogHeader>
            <DialogTitle>Report Game</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Report Reason</Label>
              <select
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                data-testid="select-report-reason"
              >
                <option value="">Select a reason...</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="spam">Spam/Scam</option>
                <option value="malware">Malware/Virus</option>
                <option value="broken">Game Not Working</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Detailed Message</Label>
              <Textarea
                id="message"
                placeholder="Please provide details about why you're reporting this game..."
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                className="min-h-[100px] bg-white/5 border-white/10"
                data-testid="textarea-report-message"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setReportOpen(false)}
                className="flex-1 border-white/10"
                data-testid="button-cancel-report"
              >
                Cancel
              </Button>
              <Button
                onClick={() => reportMutation.mutate()}
                disabled={!reportReason || reportMutation.isPending}
                className="flex-1"
                data-testid="button-submit-report"
              >
                {reportMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
