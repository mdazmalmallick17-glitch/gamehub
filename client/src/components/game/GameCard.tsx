import { Link } from "wouter";
import { Game } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.id}`}>
      <a className="block h-full">
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="h-full"
        >
          <Card className="h-full bg-card/50 border-white/5 overflow-hidden group hover:border-primary/50 transition-colors duration-300 flex flex-col">
            {/* Image Container */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <img 
                src={game.thumbnail} 
                alt={game.title}
                className="game-thumb transition-transform duration-500 group-hover:scale-110"
              />
              
              <div className="absolute top-2 right-2 z-20">
                {game.featured && (
                  <Badge className="bg-primary text-white border-none shadow-[0_0_10px_rgba(124,58,237,0.5)]">
                    FEATURED
                  </Badge>
                )}
              </div>
              
              <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1">
                <Badge variant="secondary" className="backdrop-blur-md bg-black/50 border-white/10 text-xs">
                  {game.category}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4 flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h3 className="font-display font-bold text-lg leading-tight text-white group-hover:text-primary transition-colors line-clamp-1">
                  {game.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {game.description}
              </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t border-white/5 flex justify-between items-center text-xs text-muted-foreground mt-auto">
              <div className="flex items-center gap-3 mt-3 w-full justify-between">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span className="font-medium text-white">{game.rating}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{(game.views / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span>{(game.downloads / 1000).toFixed(1)}k</span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </a>
    </Link>
  );
}
