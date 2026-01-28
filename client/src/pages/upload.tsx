import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesApi, uploadApi } from "@/lib/api";
import { AlertCircle } from "lucide-react";

export default function UploadPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
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

  const uploadMutation = useMutation({
    mutationFn: () => gamesApi.create({
      title,
      description: desc,
      category,
      thumbnail: thumbnailUrl,
      screenshots: screenshots.filter(Boolean),
      apkUrl,
      externalLink: externalLink || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({
        title: "Success!",
        description: "Game uploaded successfully. Pending approval.",
      });
      setLocation("/profile");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload game",
      });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Login Required</h1>
        <p className="mb-4 text-muted-foreground">You must be logged in to upload games.</p>
        <Button onClick={() => setLocation("/auth")}>Go to Login</Button>
      </div>
    );
  }

  const handleThumbnailUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.image(file);
      setThumbnailUrl(result.url);
      toast({ title: "Thumbnail uploaded" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upload failed", description: error.message });
    }
    setIsUploading(false);
  };

  const handleScreenshotUpload = async (file: File, _preview: string | undefined, index: number) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.image(file);
      const newScreenshots = [...screenshots];
      newScreenshots[index] = result.url;
      setScreenshots(newScreenshots);
      toast({ title: `Screenshot ${index + 1} uploaded` });
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
    if (screenshots.length === 0) {
      toast({ variant: "destructive", title: "Missing screenshots" });
      return;
    }
    uploadMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Upload New Game</CardTitle>
            <CardDescription>Share your creation with the world.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Game Title</Label>
                  <Input 
                    id="title" 
                    data-testid="input-title"
                    placeholder="e.g. Cyber Streets" 
                    className="bg-white/5 border-white/10"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="bg-white/5 border-white/10" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
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
                  data-testid="textarea-description"
                  placeholder="Describe your game..." 
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
                {thumbnailUrl && <p className="text-sm text-green-500">✓ Thumbnail uploaded</p>}
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
                  <p className="text-sm text-green-500">✓ {screenshots.filter(Boolean).length} screenshot(s) uploaded</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apkUrl">APK File URL (Required)</Label>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-400">
                    Use external links: MediaFire, Google Drive, or any hosting service. Paste the direct download link.
                  </p>
                </div>
                <Input 
                  id="apkUrl" 
                  data-testid="input-apk-url"
                  placeholder="https://drive.google.com/... or mediafire link" 
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
                  data-testid="input-external-link"
                  placeholder="https://..." 
                  className="bg-white/5 border-white/10"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 font-bold py-6 text-lg"
                disabled={uploadMutation.isPending || isUploading}
                data-testid="button-submit-game"
              >
                {uploadMutation.isPending ? "Uploading..." : "Submit Game for Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
