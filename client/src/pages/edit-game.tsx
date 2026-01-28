import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesApi, uploadApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

export default function EditGamePage() {
  const [match, params] = useRoute("/game/:id/edit");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [apkUrl, setApkUrl] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: game, isLoading } = useQuery({
    queryKey: ["game", params?.id],
    queryFn: () => gamesApi.getById(params!.id),
    enabled: !!params?.id,
    onSuccess: (data) => {
      if (data.developerId !== user?.id && user?.role !== "admin") {
        setLocation("/");
        return;
      }
      setTitle(data.title);
      setCategory(data.category);
      setDesc(data.description);
      setThumbnailUrl(data.thumbnail);
      setScreenshots(data.screenshots || []);
      setApkUrl(data.apkUrl);
      setExternalLink(data.externalLink || "");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => gamesApi.update(params!.id, {
      title,
      description: desc,
      category,
      thumbnail: thumbnailUrl,
      screenshots: screenshots.filter(Boolean),
      apkUrl,
      externalLink: externalLink || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game", params!.id] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game updated successfully!" });
      setLocation(`/game/${params!.id}`);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <Button onClick={() => setLocation("/auth")}>Go to Login</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading game...</p>
      </div>
    );
  }

  if (!match || !game) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
        <Button onClick={() => setLocation("/profile")}>Go to Profile</Button>
      </div>
    );
  }

  const handleThumbnailUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.image(file);
      setThumbnailUrl(result.url);
      toast({ title: "Thumbnail updated" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    }
    setIsUploading(false);
  };

  const handleScreenshotUpload = async (file: File, _: string | undefined, index: number) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.image(file);
      const newScreenshots = [...screenshots];
      newScreenshots[index] = result.url;
      setScreenshots(newScreenshots);
      toast({ title: `Screenshot ${index + 1} updated` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    }
    setIsUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailUrl) {
      toast({ variant: "destructive", title: "Missing thumbnail" });
      return;
    }
    if (screenshots.filter(Boolean).length === 0) {
      toast({ variant: "destructive", title: "Missing screenshots" });
      return;
    }
    updateMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Edit Game</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Game Title</Label>
                  <Input 
                    id="title" 
                    data-testid="input-edit-title"
                    className="bg-white/5 border-white/10"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-edit-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="puzzle">Puzzle</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="strategy">Strategy</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="racing">Racing</SelectItem>
                      <SelectItem value="rpg">RPG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea 
                  id="desc" 
                  data-testid="textarea-edit-description"
                  className="min-h-[100px] bg-white/5 border-white/10"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Game Thumbnail</Label>
                <FileUpload
                  label="Upload Thumbnail (Drag & Drop)"
                  onUpload={handleThumbnailUpload}
                  maxSize={10}
                />
                {thumbnailUrl && <p className="text-sm text-green-500">✓ Thumbnail updated</p>}
              </div>

              <div className="space-y-2">
                <Label>Screenshots (Min. 1)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <FileUpload
                      key={index}
                      label={`Screenshot ${index + 1}`}
                      onUpload={(file) => handleScreenshotUpload(file, undefined, index)}
                      maxSize={10}
                    />
                  ))}
                </div>
                {screenshots.filter(Boolean).length > 0 && (
                  <p className="text-sm text-green-500">✓ {screenshots.filter(Boolean).length} screenshot(s) updated</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apkUrl">APK File URL</Label>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-400">
                    Use external links: MediaFire, Google Drive, or any hosting service.
                  </p>
                </div>
                <Input 
                  id="apkUrl" 
                  data-testid="input-edit-apk-url"
                  className="bg-white/5 border-white/10"
                  value={apkUrl}
                  onChange={(e) => setApkUrl(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external">External Download Link (Optional)</Label>
                <Input 
                  id="external" 
                  data-testid="input-edit-external-link"
                  className="bg-white/5 border-white/10"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setLocation(`/game/${params!.id}`)}
                  className="flex-1"
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90 font-bold py-6"
                  disabled={updateMutation.isPending || isUploading}
                  data-testid="button-save-game"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
