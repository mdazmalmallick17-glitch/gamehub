import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth";
import GameDetails from "@/pages/game-details";
import ProfilePage from "@/pages/profile";
import DeveloperProfile from "@/pages/developer-profile";
import UploadPage from "@/pages/upload";
import AdminPage from "@/pages/admin";
import BrowsePage from "@/pages/browse";
import EditGamePage from "@/pages/edit-game";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/browse" component={BrowsePage} />
      <Route path="/game/:id" component={GameDetails} />
      <Route path="/game/:id/edit" component={EditGamePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/developer/:id" component={DeveloperProfile} />
      <Route path="/upload" component={UploadPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
