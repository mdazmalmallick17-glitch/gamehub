import { motion } from "framer-motion";
import { Game } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { Link } from "wouter";

interface FeaturedHeroProps {
  game: Game;
}

export function FeaturedHero({ game }: FeaturedHeroProps) {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl mb-12 group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={game.thumbnail} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary text-xs font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(124,58,237,0.3)]">
              Featured Game
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-bold tracking-wider uppercase">
              {game.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 leading-tight neon-text">
            {game.title}
          </h1>

          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl line-clamp-3">
            {game.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href={`/game/${game.id}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 h-14 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all hover:scale-105">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Play Now
              </Button>
            </Link>
            <Link href={`/game/${game.id}`}>
              <Button size="lg" variant="outline" className="bg-black/30 backdrop-blur-md border-white/20 text-white hover:bg-white/10 font-semibold text-lg px-8 h-14 rounded-full">
                <Info className="mr-2 h-5 w-5" />
                More Details
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
