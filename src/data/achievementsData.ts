
import { Car, MapPin, Image, Trophy, Award, Medal, LucideIcon } from "lucide-react";

export type AchievementCategory = "luoghi" | "auto" | "foto" | "detective" | "completamento";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  iconComponent: LucideIcon;
  requiredCount: number;
  badgeColor: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export const achievements: Achievement[] = [
  // Luoghi (Locations)
  {
    id: "luoghi-novice",
    title: "Esploratore Novizio",
    description: "Hai scoperto il tuo primo indizio sulla posizione",
    category: "luoghi",
    iconComponent: MapPin,
    requiredCount: 1,
    badgeColor: "bg-gradient-to-r from-blue-400 to-blue-600",
    isUnlocked: false
  },
  {
    id: "luoghi-expert",
    title: "Cartografo Esperto",
    description: "Hai scoperto 3 indizi sulla posizione",
    category: "luoghi",
    iconComponent: MapPin,
    requiredCount: 3,
    badgeColor: "bg-gradient-to-r from-blue-500 to-indigo-600",
    isUnlocked: false
  },
  
  // Auto (Cars)
  {
    id: "auto-novice",
    title: "Meccanico Principiante",
    description: "Hai scoperto il tuo primo indizio sull'auto",
    category: "auto",
    iconComponent: Car,
    requiredCount: 1,
    badgeColor: "bg-gradient-to-r from-red-400 to-red-600",
    isUnlocked: false
  },
  {
    id: "auto-expert",
    title: "Ingegnere Automobilistico",
    description: "Hai scoperto 3 indizi sull'auto",
    category: "auto",
    iconComponent: Car,
    requiredCount: 3,
    badgeColor: "bg-gradient-to-r from-red-500 to-pink-600",
    isUnlocked: false
  },
  
  // Foto (Photos)
  {
    id: "foto-novice",
    title: "Fotografo Dilettante",
    description: "Hai scoperto il tuo primo indizio fotografico",
    category: "foto",
    iconComponent: Image,
    requiredCount: 1,
    badgeColor: "bg-gradient-to-r from-purple-400 to-purple-600",
    isUnlocked: false
  },
  {
    id: "foto-expert",
    title: "Occhio Fotografico",
    description: "Hai scoperto 3 indizi fotografici",
    category: "foto",
    iconComponent: Image,
    requiredCount: 3,
    badgeColor: "bg-gradient-to-r from-purple-500 to-violet-600",
    isUnlocked: false
  },
  
  // Detective
  {
    id: "detective-novice",
    title: "Investigatore Novizio",
    description: "Hai scoperto il tuo primo indizio generale",
    category: "detective",
    iconComponent: Award,
    requiredCount: 1,
    badgeColor: "bg-gradient-to-r from-green-400 to-green-600",
    isUnlocked: false
  },
  {
    id: "detective-expert",
    title: "Detective Provetto",
    description: "Hai scoperto 3 indizi generali",
    category: "detective",
    iconComponent: Award,
    requiredCount: 3,
    badgeColor: "bg-gradient-to-r from-green-500 to-emerald-600",
    isUnlocked: false
  },
  
  // Completamento (Completion)
  {
    id: "completamento-25",
    title: "Inizio del Percorso",
    description: "Hai sbloccato il 25% degli indizi",
    category: "completamento",
    iconComponent: Trophy,
    requiredCount: 25,
    badgeColor: "bg-gradient-to-r from-amber-400 to-amber-600",
    isUnlocked: false
  },
  {
    id: "completamento-50",
    title: "A Metà Strada",
    description: "Hai sbloccato il 50% degli indizi",
    category: "completamento",
    iconComponent: Trophy,
    requiredCount: 50,
    badgeColor: "bg-gradient-to-r from-amber-500 to-yellow-600",
    isUnlocked: false
  },
  {
    id: "completamento-75",
    title: "Quasi Completato",
    description: "Hai sbloccato il 75% degli indizi",
    category: "completamento",
    iconComponent: Medal,
    requiredCount: 75,
    badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-600",
    isUnlocked: false
  },
  {
    id: "completamento-100",
    title: "Master Detective",
    description: "Hai sbloccato tutti gli indizi disponibili",
    category: "completamento",
    iconComponent: Trophy,
    requiredCount: 100,
    badgeColor: "bg-gradient-to-r from-projectx-gold to-yellow-500",
    isUnlocked: false
  }
];
