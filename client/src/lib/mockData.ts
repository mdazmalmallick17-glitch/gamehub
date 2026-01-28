import { User, Game, Review } from "./types";
import logoImg from "@assets/generated_images/futuristic_h_letter_logo_for_gaming_platform.png";
import cyberImg from "@assets/generated_images/cyberpunk_city_game_cover-art.png"; // Assuming filename, will check actual filenames in next step if needed, but usually tool returns predictable names. Actually tool returned filenames in previous turn.
// The tool output said:
// attached_assets/generated_images/futuristic_h_letter_logo_for_gaming_platform.png
// attached_assets/generated_images/cyberpunk_city_game_cover_art.png
// attached_assets/generated_images/fantasy_rpg_game_cover_art.png
// attached_assets/generated_images/space_shooter_game_cover_art.png

import cyberCover from "@assets/generated_images/cyberpunk_city_game_cover_art.png";
import fantasyCover from "@assets/generated_images/fantasy_rpg_game_cover_art.png";
import spaceCover from "@assets/generated_images/space_shooter_game_cover_art.png";

export const USERS: User[] = [
  {
    id: "7123456",
    username: "admin.admin@gmail.com",
    password: "admin9123761447",
    role: "admin",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    bio: "Platform Administrator",
    joinedAt: new Date().toISOString()
  },
  {
    id: "7654321",
    username: "gamer1@gmail.com",
    password: "password123",
    role: "user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamer1",
    bio: "Hardcore gamer",
    joinedAt: new Date().toISOString()
  }
];

export const GAMES: Game[] = [
  {
    id: "1",
    title: "Cyber Streets 2077",
    description: "Explore the neon-soaked streets of a futuristic metropolis in this open-world RPG. Hack, fight, and survive in a city that never sleeps.",
    category: "RPG",
    rating: 4.8,
    downloads: 12500,
    views: 45000,
    developer: "Studio Red",
    developerId: "7654321",
    thumbnail: cyberCover,
    screenshots: [
       "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070",
       "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"
    ],
    apkUrl: "#",
    status: "approved",
    featured: true,
    uploadDate: new Date().toISOString(),
    price: 0
  },
  {
    id: "2",
    title: "Dragon's Ascension",
    description: "Take flight as a dragon in this stunning aerial combat game. Master the elements and rule the skies.",
    category: "Action",
    rating: 4.5,
    downloads: 8200,
    views: 21000,
    developer: "IndieDev",
    developerId: "7654321",
    thumbnail: fantasyCover,
    screenshots: [
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165"
    ],
    apkUrl: "#",
    status: "approved",
    featured: false,
    uploadDate: new Date().toISOString(),
    price: 0
  },
  {
    id: "3",
    title: "Stellar Conflict",
    description: "Command a fleet of starships in deep space battles. Strategy is your only weapon against the void.",
    category: "Strategy",
    rating: 4.2,
    downloads: 5000,
    views: 15000,
    developer: "SpaceGames",
    developerId: "7654321",
    thumbnail: spaceCover,
    screenshots: [
        "https://images.unsplash.com/photo-1614730341194-75c607400070?q=80&w=2148",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
    ],
    apkUrl: "#",
    status: "approved",
    featured: true,
    uploadDate: new Date().toISOString(),
    price: 0
  }
];

export const REVIEWS: Review[] = [
  {
    id: "1",
    gameId: "1",
    userId: "7654321",
    username: "gamer1",
    rating: 5,
    comment: "Absolutely stunning visuals and gameplay! Best indie game of the year.",
    date: new Date().toISOString()
  }
];

export const LOGO = logoImg;
