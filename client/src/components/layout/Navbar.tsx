import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, User as UserIcon, LogOut, Heart } from "lucide-react";
import { LOGO } from "@/lib/mockData";
import { DonateModal } from "./DonateModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-lg">
        <div className="w-full px-2 sm:px-4 py-2">
          {/* Top Row - Logo and main nav items */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Logo */}
            <button onClick={() => setLocation("/")} className="flex items-center gap-1 sm:gap-2 group cursor-pointer min-w-0">
              <img 
                src={LOGO} 
                alt="Pocket Game Store" 
                className="h-8 w-8 object-contain transition-transform group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" 
              />
              <span className="font-display font-bold text-sm sm:text-lg tracking-wider text-white group-hover:text-primary transition-colors truncate">
                POCKET<span className="text-primary"> GAME STORE</span>
              </span>
            </button>

            {/* Center Actions - visible on all sizes */}
            <div className="flex items-center gap-1 sm:gap-3 flex-1 justify-center">
              {/* Browse Button */}
              <Button 
                onClick={() => setLocation("/browse")}
                variant="ghost"
                size="sm"
                className="text-xs sm:text-sm font-medium"
                data-testid="button-browse"
              >
                Browse
              </Button>

              {/* Donate Button */}
              <Button
                onClick={() => setDonateOpen(true)}
                variant="ghost"
                size="sm"
                className="gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs sm:text-sm"
                data-testid="button-donate"
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Donate</span>
              </Button>
            </div>

            {/* Right side - User actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {user.role === 'admin' && (
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       className="hidden sm:flex text-destructive hover:text-destructive/90 text-xs"
                       onClick={() => setLocation("/admin")}
                     >
                       Admin
                     </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    className="hidden sm:flex gap-1 bg-primary hover:bg-primary/90 text-white rounded-full shadow-[0_0_15px_rgba(124,58,237,0.3)] text-xs"
                    onClick={() => setLocation("/upload")}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ring-2 ring-transparent hover:ring-primary transition-all">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="bg-primary/20 text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black/90 border-white/10 backdrop-blur-xl text-white" align="end">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.username}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.role === 'admin' ? 'Administrator' : 'Gamer'}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="focus:bg-white/10 cursor-pointer" onClick={() => setLocation('/profile')}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-white/10 cursor-pointer sm:hidden" onClick={() => setLocation('/upload')}>
                        <Upload className="mr-2 h-4 w-4" />
                        <span>Upload Game</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem className="focus:bg-white/10 text-destructive focus:text-destructive cursor-pointer" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 text-xs sm:text-sm"
                    onClick={() => setLocation("/auth")}
                  >
                    Log In
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-white/90 font-semibold text-xs sm:text-sm"
                    onClick={() => setLocation("/auth?tab=register")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row - Search Bar (visible on all sizes) */}
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search games..." 
              className="w-full pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-full text-xs sm:text-base py-1.5 sm:py-2"
              data-testid="input-search-navbar"
            />
          </div>
        </div>
      </nav>
      
      <DonateModal open={donateOpen} onOpenChange={setDonateOpen} />
    </>
  );
}
