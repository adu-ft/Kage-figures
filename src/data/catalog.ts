import { INSTAGRAM_CATALOGUE_URLS } from './instagramUrls';
import { PRODUCT_INSTAGRAM_MAPPINGS } from './productInstagramMapping';
import luffyHeroImg from '../assets/images/luffy_hero_figure.webp';
import sasukeHeroImg from '../assets/images/sasuke_hero_figure.webp';
import katanaHeroImg from '../assets/images/katana_hero_display.webp';
import carsHeroImg from '../assets/images/diecast_car_hero.webp';
import mangaFrameHeroImg from '../assets/images/manga_frame_hero.webp';
import keychainsCoverImg from '../assets/images/keychains_cover.webp';
import actionFiguresCoverImg from '../assets/images/action_figures_cover.webp';
import carsCoverImg from '../assets/images/cars_cover.webp';
import katanaCoverImg from '../assets/images/katana_cover.webp';
import mangaFrameCoverImg from '../assets/images/manga_frame_cover.webp';

export type CategoryName =
  | 'Anime Keychains'
  | 'Anime Action Figures'
  | 'Cars Figures'
  | 'Katana'
  | 'Manga Frame';

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  subcopy: string;
  ctaLabel: string;
  targetSection: string;
  filterCategory?: string;
  imageUrl: string;
  fallbackUrl: string;
  imagePositionClass?: string;
  badgeText?: string;
}

export interface ImageLinkBlock {
  id: string;
  title: string;
  subtitle: string;
  categoryFilter: CategoryName;
  imageUrl: string;
  fallbackUrl: string;
}

export interface CollectionItem {
  id: string;
  title: CategoryName;
  countLabel: string;
  description: string;
  categoryFilter: CategoryName;
  imageUrl: string;
  fallbackUrl: string;
}

export interface ProductVariant {
  id: string;
  label: string;
  priceDelta: number;
}

export interface Product {
  id: string;
  code: string;
  title: string;
  studio: string;
  category: CategoryName;
  scale: string;
  dimensions: string;
  editionSize: string;
  price: number;
  compareAtPrice?: number;
  status: 'In Stock' | 'Pre-Order' | 'On Sale' | 'Limited' | 'Sold Out';
  sectionGroup: 'featured' | 'sale' | 'vault';
  imageUrl: string;
  images: string[];
  slideUrls?: string[];
  fallbackUrl: string;
  description: string;
  variants: ProductVariant[];
  instagramUrl: string;
  instagramPostIndex: number;
  instagramShortcode: string;
}

export const LOGO_URL = '/catalogue/kage-logo.webp';

export const LOCAL_FALLBACKS = [
  keychainsCoverImg,
  actionFiguresCoverImg,
  carsCoverImg,
  katanaCoverImg,
  mangaFrameCoverImg,
] as const;

const igImg = (index: number) =>
  `/catalogue/p-${String(index % INSTAGRAM_CATALOGUE_URLS.length).padStart(3, '0')}.webp`;

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'KAGE FIGURES · INSTAGRAM CATALOGUE',
    headline: 'Anime Action Figures, Katana & Collectibles',
    subcopy:
      'Explore all 138 curated Instagram drops — anime action figures, keychains, cars figures, katana replicas, and manga frames.',
    ctaLabel: 'Browse Catalogue',
    targetSection: '#featured-collection',
    filterCategory: 'All',
    imageUrl: luffyHeroImg,
    fallbackUrl: actionFiguresCoverImg,
    imagePositionClass: 'object-[72%_center] md:object-center',
    badgeText: '138 Drops Live',
  },
  {
    id: 'slide-2',
    eyebrow: 'KAGE FIGURES · FEATURED DROPS',
    headline: 'Premium Anime Action Figures & Display Pieces',
    subcopy:
      'Detailed collector sculptures with custom bases, crisp paintwork, and insured pan-India shipping.',
    ctaLabel: 'Explore Figures',
    targetSection: '#featured-collection',
    filterCategory: 'Anime Action Figures',
    imageUrl: sasukeHeroImg,
    fallbackUrl: actionFiguresCoverImg,
    imagePositionClass: 'object-[70%_center] md:object-center',
    badgeText: 'New Arrival',
  },
  {
    id: 'slide-3',
    eyebrow: 'KAGE FIGURES · ORNAMENTAL BLADES',
    headline: 'Anime Katana Replicas & LED Display Swords',
    subcopy:
      'Display-grade braided hilts, glowing LED editions, and matching tabletop wooden stands.',
    ctaLabel: 'Explore Katanas',
    targetSection: '#featured-collection',
    filterCategory: 'Katana',
    imageUrl: katanaHeroImg,
    fallbackUrl: katanaCoverImg,
    imagePositionClass: 'object-[68%_center] md:object-center',
    badgeText: 'Katana Drop',
  },
  {
    id: 'slide-4',
    eyebrow: 'KAGE FIGURES · SCALE GARAGE',
    headline: 'Die-Cast Collector Cars & 1:64 Scale Models',
    subcopy:
      'Precision alloy supercars, pull-back icons, and display-ready street legends.',
    ctaLabel: 'Explore Cars',
    targetSection: '#featured-collection',
    filterCategory: 'Cars Figures',
    imageUrl: carsHeroImg,
    fallbackUrl: carsCoverImg,
    imagePositionClass: 'object-[62%_center] md:object-center',
    badgeText: 'Die-Cast',
  },
  {
    id: 'slide-5',
    eyebrow: 'KAGE FIGURES · DESK & WALL ART',
    headline: 'Backlit 3D Shadowbox Manga Frames',
    subcopy:
      'Layered black-and-white manga panels with warm ambient LED edge glow for your setup.',
    ctaLabel: 'Explore Frames',
    targetSection: '#featured-collection',
    filterCategory: 'Manga Frame',
    imageUrl: mangaFrameHeroImg,
    fallbackUrl: mangaFrameCoverImg,
    imagePositionClass: 'object-[64%_center] md:object-center',
    badgeText: 'Warm LED',
  },
];

export const IMAGE_LINK_BLOCKS: ImageLinkBlock[] = [
  {
    id: 'block-action-figures',
    title: 'Anime Figures',
    subtitle: 'PVC Statues & Scale Sculptures',
    categoryFilter: 'Anime Action Figures',
    imageUrl: actionFiguresCoverImg,
    fallbackUrl: actionFiguresCoverImg,
  },
  {
    id: 'block-katana',
    title: 'Katana',
    subtitle: 'Ornamental Display Blades & Stands',
    categoryFilter: 'Katana',
    imageUrl: katanaCoverImg,
    fallbackUrl: katanaCoverImg,
  },
  {
    id: 'block-manga-frame',
    title: 'Manga Frame',
    subtitle: '3D Backlit & Framed Wall Panels',
    categoryFilter: 'Manga Frame',
    imageUrl: mangaFrameCoverImg,
    fallbackUrl: mangaFrameCoverImg,
  },
  {
    id: 'block-cars',
    title: 'Cars',
    subtitle: '1/18, 1/24 & 1/64 Die-Cast Models',
    categoryFilter: 'Cars Figures',
    imageUrl: carsCoverImg,
    fallbackUrl: carsCoverImg,
  },
  {
    id: 'block-keychains',
    title: 'Key Chains',
    subtitle: 'Metal · Enamel · Silicone Charms',
    categoryFilter: 'Anime Keychains',
    imageUrl: keychainsCoverImg,
    fallbackUrl: keychainsCoverImg,
  },
];

export const MARQUEE_ITEMS = [
  'KAGE FIGURES INSTAGRAM CATALOGUE',
  'ANIME KEYCHAINS',
  'ANIME ACTION FIGURES',
  'CARS FIGURES',
  'KATANA',
  'MANGA FRAME',
  'INSURED PAN-INDIA DELIVERY',
];

const FALLBACK_BY_CATEGORY: Record<CategoryName, string> = {
  'Anime Keychains': keychainsCoverImg,
  'Anime Action Figures': actionFiguresCoverImg,
  'Cars Figures': carsCoverImg,
  Katana: katanaCoverImg,
  'Manga Frame': mangaFrameCoverImg,
};

interface RawCatalogEntry {
  title: string;
  price: number;
  category: CategoryName;
  studio?: string;
  scale?: string;
  dimensions?: string;
  soldOut?: boolean;
}

const CATALOG_ENTRIES: RawCatalogEntry[] = [
  { title: "Deadpool Collector Metal Keychain", price: 99, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "One Piece Straw Hat Pirates Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6.5cm \u00b7 Split Ring" },
  { title: "Demon Slayer Nichirin Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Hunter x Hunter Hunter License Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Alloy", dimensions: "5cm \u00b7 Split Ring" },
  { title: "Batman Dark Knight Metal Keychain", price: 99, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Dragon Ball Z Radar Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Jujutsu Kaisen Sukuna Finger Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Resin & Alloy", dimensions: "7cm \u00b7 Split Ring" },
  { title: "Naruto Uzumaki Rasengan Action Figure", price: 549, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Chakra Base" },
  { title: "Tokyo Ghoul Kaneki Mask Metal Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Alloy", dimensions: "5cm \u00b7 Split Ring" },
  { title: "Bleach Hollow Mask Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "My Hero Academia All Might Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Solo Leveling Shadow Monarch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Alloy", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Chainsaw Man Pochita Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Death Note Ryuk Apple Metal Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "5.5cm \u00b7 Split Ring" },
  { title: "Fullmetal Alchemist Flamel Cross Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Alloy", dimensions: "5.5cm \u00b7 Split Ring" },
  { title: "Berserk Brand of Sacrifice Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Antique Bronze", dimensions: "5cm \u00b7 Split Ring" },
  { title: "Attack on Titan Scout Wings Pocket Watch", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "One Piece Ace Flame Hat Metal Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "5.5cm \u00b7 Split Ring" },
  { title: "One Piece Turtle Metal Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Antique Alloy", dimensions: "6.5cm \u00b7 Split Ring" },
  { title: "Attack on Titan Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Yin Yang Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Friends Forever Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Vintage Anchor Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Gojo Satoru Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Chelsea FC Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Ladybug Brass Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Son Goku Dragon Ball Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Paris Saint-Germain Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "PUBG Brass Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Baby Yoda Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Star Wars Darth Vader Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Fitness Dumbbell Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Death Note Rectangular Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "5cm \u00b7 Chain & Box" },
  { title: "Cristiano Ronaldo 7 Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Velvet Box" },
  { title: "Wonder Woman Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chrome Case" },
  { title: "Superman Bronze Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Antique Brass" },
  { title: "Vintage Roman Numeral Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Mechanical" },
  { title: "Winged Mechanical Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Survey Corps Crest Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Brass Finish" },
  { title: "Lionel Messi 10 Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Gloss Black" },
  { title: "Akatsuki Cloud Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Chain & Ring" },
  { title: "Best Brother Ever Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Gift Box" },
  { title: "Stark Direwolf Vintage Pocket Watch Keychain", price: 299, category: "Anime Keychains", studio: "Kage Craft", scale: "Pocket Watch", dimensions: "4.5cm \u00b7 Antique Bronze" },
  { title: "Nezuko Kamado Anime Metal Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Kakashi Hatake Chibi Red Metal Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Kakashi Hatake Sharingan Metal Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Kakashi Hatake Blister Metal Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Black Dragon Curved Anime Knife Keychain", price: 249, category: "Anime Keychains", studio: "Kage Craft", scale: "Die-Cast Alloy", dimensions: "13cm \u00b7 Display Ring" },
  { title: "Blue Camo Curved Anime Knife Keychain", price: 249, category: "Anime Keychains", studio: "Kage Craft", scale: "Die-Cast Alloy", dimensions: "13cm \u00b7 Display Ring" },
  { title: "Silver Dragon Curved Anime Knife Keychain", price: 249, category: "Anime Keychains", studio: "Kage Craft", scale: "Die-Cast Alloy", dimensions: "13cm \u00b7 Display Ring" },
  { title: "Tanjiro Kamado Water Emblem Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Chibi Samurai Round Metal Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Monkey D. Luffy One Piece Metal Spinner Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Spinner", dimensions: "6.5cm \u00b7 Split Ring" },
  { title: "Tanjiro Kamado Red Medallion Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Tanjiro Kamado Chibi Cutout Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Inosuke Hashibira Anime Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Uchiha Sharingan Collector Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Alloy", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Straw Hat Pirates Black Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Metal Clasp" },
  { title: "Dragon Ball Z Trunks Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "Naruto Uzumaki Orange Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "Bleach Ichigo Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "Dragon Ball Broly Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "One Piece Luffy Blue Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "Roronoa Zoro Mini Sword Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Alloy Mini Blade", dimensions: "16cm \u00b7 Scabbard Ring" },
  { title: "Yuji Itadori Jujutsu Kaisen Metal Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Enamel", dimensions: "6cm \u00b7 Split Ring" },
  { title: "Son Goku Dragon Ball Bag Tag Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "Roronoa Zoro Green Bag Tag Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Bag Clasp" },
  { title: "Uchiha Itachi Akatsuki Strap Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Woven Strap", dimensions: "14cm \u00b7 Split Ring" },
  { title: "Son Goku on Motorbike Action Figure", price: 699, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Bike Diorama" },
  { title: "Demon Slayer Dual Nichirin Sword Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Alloy Mini Blade", dimensions: "16cm \u00b7 Scabbard Ring" },
  { title: "One Piece Gold Katana Sword Keychain", price: 109, category: "Anime Keychains", studio: "Kage Craft", scale: "Alloy Mini Blade", dimensions: "15cm \u00b7 Split Ring" },
  { title: "Trasped Mini RC Car 1:64 Alloy Model (Red)", price: 1199, category: "Cars Figures", studio: "Trasped", scale: "1:64 Alloy RC", dimensions: "App & Remote \u00b7 USB-C", soldOut: true },
  { title: "Son Goku Super Saiyan Blue Action Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base", soldOut: true },
  { title: "Kakashi Hatake Copy Ninja Action Figure", price: 749, category: "Anime Action Figures", studio: "Kage Studio", scale: "24cm PVC", dimensions: "H 24cm \u00b7 Scenic Base" },
  { title: "Black Matte Supercar 1:32 Die-Cast Car", price: 349, category: "Cars Figures", studio: "AutoArt", scale: "1:32 Die-Cast", dimensions: "L 15cm \u00b7 Opening Doors" },
  { title: "Mercedes AMG Silver Metal Pull-Back Car", price: 449, category: "Cars Figures", studio: "Bburago", scale: "1:32 Die-Cast", dimensions: "L 15cm \u00b7 Pull-Back" },
  { title: "Mini RC Racing Car 1:64 Scale Alloy Box Set", price: 999, category: "Cars Figures", studio: "Trasped", scale: "1:64 Alloy RC", dimensions: "2.4GHz Remote \u00b7 LED" },
  { title: "Blue Track Supercar 1:32 Die-Cast Car", price: 349, category: "Cars Figures", studio: "Mini GT", scale: "1:32 Die-Cast", dimensions: "L 15cm \u00b7 Metal Body" },
  { title: "Demon Slayer Mini Katana Keychain", price: 249, category: "Anime Keychains", studio: "Kage Craft", scale: "Metal Scabbard", dimensions: "17cm \u00b7 Blister Card" },
  { title: "Naruto Shinobi Kunai 3-Piece Collector Set", price: 499, category: "Katana", studio: "Shinobi Blade", scale: "Collector Set", dimensions: "Kunai Trio + Headband", soldOut: true },
  { title: "Naruto Uzumaki Shinobi Action Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Stand" },
  { title: "Zenitsu Flame Sword Collector Notebook", price: 199, category: "Manga Frame", studio: "InkFrame Studio", scale: "A5 Hardcover", dimensions: "21\u00d715cm \u00b7 Gloss Print", soldOut: true },
  { title: "Naruto Uzumaki Seventh Hokage Action Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base", soldOut: true },
  { title: "Agatsuma Zenitsu Chibi Fridge Magnet", price: 199, category: "Anime Keychains", studio: "Kage Craft", scale: "Acrylic Magnet", dimensions: "8cm \u00b7 Gloss Print" },
  { title: "Deidara Akatsuki Cloak Action Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base", soldOut: true },
  { title: "Gaara of the Sand Collectible Action Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base" },
  { title: "Uchiha Sasuke Collector Action Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base", soldOut: true },
  { title: "Naruto Uzumaki Hokage Cape Action Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base" },
  { title: "Naruto Uzumaki Sage Mode Glow Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base" },
  { title: "Nezuko Kamado 3D Layered Manga Frame", price: 399, category: "Manga Frame", studio: "Mono Shadowbox", scale: "3D Wall Frame", dimensions: "25\u00d720cm \u00b7 Matte White" },
  { title: "Agatsuma Zenitsu LED Manga Lightbox Frame", price: 499, category: "Manga Frame", studio: "Kage Gallery", scale: "LED Shadowbox", dimensions: "24\u00d718cm \u00b7 USB Warm LED" },
  { title: "Monkey D. Luffy Gear 5 Standing Figure", price: 499, category: "Anime Action Figures", studio: "Kage Studio", scale: "21cm PVC", dimensions: "H 21cm \u00b7 Lightning Effect" },
  { title: "Monkey D. Luffy Gear 5 Mid-Air Kick Figure", price: 249, category: "Anime Action Figures", studio: "Kage Studio", scale: "16cm PVC", dimensions: "H 16cm \u00b7 Display Stand" },
  { title: "Monkey D. Luffy Gear 5 Cloud Sitting Figure", price: 249, category: "Anime Action Figures", studio: "Kage Studio", scale: "16cm PVC", dimensions: "H 16cm \u00b7 Display Stand", soldOut: true },
  { title: "Monkey D. Luffy Gear 5 Dynamic Leap Figure", price: 249, category: "Anime Action Figures", studio: "Kage Studio", scale: "16cm PVC", dimensions: "H 16cm \u00b7 Display Stand", soldOut: true },
  { title: "Akatsuki & Sharingan Anime Rings Box Set", price: 499, category: "Anime Keychains", studio: "Kage Craft", scale: "Collector Ring Set", dimensions: "10 Rings + Necklace Chain", soldOut: true },
  { title: "Son Goku Flying Nimbus Action Figure", price: 399, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Nimbus Base" },
  { title: "Berserk Skull Knight Collector Statue", price: 1499, category: "Anime Action Figures", studio: "Kage Studio", scale: "28cm Collector", dimensions: "H 28cm \u00b7 Stone Base", soldOut: true },
  { title: "Kyojuro Rengoku Flame Hashira Figure", price: 649, category: "Anime Action Figures", studio: "Kage Studio", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Flame Effect" },
  { title: "Zenitsu Thunderclap White Manga Frame", price: 499, category: "Manga Frame", studio: "Kage Gallery", scale: "Thick Shadowbox", dimensions: "25\u00d720cm \u00b7 White Frame", soldOut: true },
  { title: "Shenron Eternal Dragon Collector Statue", price: 1499, category: "Anime Action Figures", studio: "Kage Studio", scale: "28cm Diorama", dimensions: "H 28cm \u00b7 7 Dragon Balls", soldOut: true },
  { title: "Princess Shirahoshi Mermaid Figure", price: 999, category: "Anime Action Figures", studio: "Banpresto", scale: "23cm PVC", dimensions: "H 23cm \u00b7 Coral Base" },
  { title: "Megumi Fushiguro Ten Shadows Figure", price: 999, category: "Anime Action Figures", studio: "Bandai Tamashii", scale: "22cm PVC", dimensions: "H 22cm \u00b7 Battle Stance", soldOut: true },
  { title: "Zenitsu Agatsuma Chibi Mobile Holder Figure", price: 349, category: "Anime Action Figures", studio: "Kage Craft", scale: "12cm Chibi", dimensions: "H 12cm \u00b7 Phone Dock" },
  { title: "Chisato Nishikigi Aqua Float Girls Figure", price: 699, category: "Anime Action Figures", studio: "Taito", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Swim Ring" },
  { title: "Rem Celestial Vivi Swimsuit Ver. Figure", price: 699, category: "Anime Action Figures", studio: "Banpresto", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Beach Base" },
  { title: "Muzan Kibutsuji Final Form Figure", price: 1299, category: "Anime Action Figures", studio: "Kage Studio", scale: "25cm PVC", dimensions: "H 25cm \u00b7 Blood Whip Base", soldOut: true },
  { title: "Tanjiro Kamado Water Dragon Action Figure", price: 749, category: "Anime Action Figures", studio: "Kage Studio", scale: "22cm PVC", dimensions: "H 22cm \u00b7 Water Spiral", soldOut: true },
  { title: "Goku & Vegeta SSB Collector A5 Notebook", price: 199, category: "Manga Frame", studio: "InkFrame Studio", scale: "A5 Hardcover", dimensions: "21\u00d715cm \u00b7 Smooth Paper" },
  { title: "Satoru Gojo Blindfold Chibi Figure", price: 249, category: "Anime Action Figures", studio: "Kage Craft", scale: "11cm PVC", dimensions: "H 11cm \u00b7 Display Stand", soldOut: true },
  { title: "Sanemi Shinazugawa Katana (Without Light)", price: 1499, category: "Katana", studio: "Kyoto Armory", scale: "104cm Full Size", dimensions: "104cm \u00b7 Black Scabbard" },
  { title: "One Piece Grand Hourglass Pirate Edition", price: 499, category: "Anime Action Figures", studio: "Kage Craft", scale: "Desk Diorama", dimensions: "H 16cm \u00b7 Thousand Sunny", soldOut: true },
  { title: "Yuji Itadori Crimson Scroll Edition Figure", price: 249, category: "Anime Action Figures", studio: "Kage Craft", scale: "11cm PVC", dimensions: "H 11cm \u00b7 Display Stand", soldOut: true },
  { title: "Nobara Kugisaki Hammer Pose Chibi Figure", price: 249, category: "Anime Action Figures", studio: "Kage Craft", scale: "11cm PVC", dimensions: "H 11cm \u00b7 Display Stand", soldOut: true },
  { title: "Son Goku Ultra Instinct Sign Action Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base" },
  { title: "Sanemi Shinazugawa Green LED Light Katana", price: 1999, category: "Katana", studio: "Kyoto Armory", scale: "104cm LED Katana", dimensions: "104cm \u00b7 Glowing Blade", soldOut: true },
  { title: "Monkey D. Luffy Straw Hat Pirate Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Harbour Base", soldOut: true },
  { title: "Monkey D. Luffy Wano Kuni Ver. Figure", price: 299, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Kimono Pose", soldOut: true },
  { title: "Son Goku Super Saiyan Blue Chibi Figure", price: 249, category: "Anime Action Figures", studio: "Kage Craft", scale: "12cm PVC", dimensions: "H 12cm \u00b7 Display Stand" },
  { title: "Futuristic Cyber LED Spark Katana", price: 999, category: "Katana", studio: "Kage Forge", scale: "80cm LED Blade", dimensions: "RGB Blade \u00b7 Smoke & Spark", soldOut: true },
  { title: "Portgas D. Ace Fire Fist Action Figure", price: 599, category: "Anime Action Figures", studio: "Kage Studio", scale: "21cm PVC", dimensions: "H 21cm \u00b7 Flame Effects" },
  { title: "Vegeta Ultra Ego God of Pride Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base", soldOut: true },
  { title: "Super Saiyan Son Goku Classic Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base", soldOut: true },
  { title: "Kamado Tanjiro Water Breathing First Form", price: 599, category: "Anime Action Figures", studio: "Kage Studio", scale: "21cm PVC", dimensions: "H 21cm \u00b7 Wave Base", soldOut: true },
  { title: "Son Goku Martial Arts Action Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "18cm PVC", dimensions: "H 18cm \u00b7 Display Base" },
  { title: "Son Goku Staff Version Power Figure", price: 499, category: "Anime Action Figures", studio: "Kage Studio", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Display Base" },
  { title: "Tanjiro Commando Dark Edition Figure", price: 699, category: "Anime Action Figures", studio: "Kage Studio", scale: "22cm PVC", dimensions: "H 22cm \u00b7 Translucent Dragon" },
  { title: "Dragon Ball Legends Goku & Shenron Diorama", price: 1199, category: "Anime Action Figures", studio: "Kage Studio", scale: "26cm Diorama", dimensions: "H 26cm \u00b7 Scenic Cloud", soldOut: true },
  { title: "Mitsuri Kanroji Love Hashira Action Figure", price: 499, category: "Anime Action Figures", studio: "Kage Studio", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Whip Katana", soldOut: true },
  { title: "Muichiro Tokito Mist Hashira Figure", price: 499, category: "Anime Action Figures", studio: "Kage Studio", scale: "19cm PVC", dimensions: "H 19cm \u00b7 Nichirin Pose" },
  { title: "Tanjiro Kamado Hinokami Kagura Figure", price: 499, category: "Anime Action Figures", studio: "Kage Studio", scale: "21cm PVC", dimensions: "H 21cm \u00b7 Dynamic Slash" },
  { title: "Agatsuma Zenitsu Thunder Breathing Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Lightning Base" },
  { title: "Giyu Tomioka Water Hashira Action Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "21cm PVC", dimensions: "H 21cm \u00b7 Splash Base" },
  { title: "Shinobu Kocho Insect Hashira Action Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Butterfly FX" },
  { title: "Nezuko Kamado Awakened Demon Slayer Figure", price: 199, category: "Anime Action Figures", studio: "Kage Studio", scale: "20cm PVC", dimensions: "H 20cm \u00b7 Display Base", soldOut: true },
];

const DEFAULT_STUDIO: Record<CategoryName, string> = {
  'Anime Keychains': 'Kage Craft',
  'Anime Action Figures': 'Kage Studio',
  'Cars Figures': 'AutoArt',
  Katana: 'Kage Forge',
  'Manga Frame': 'Kage Gallery',
};

export const PRODUCTS: Product[] = PRODUCT_INSTAGRAM_MAPPINGS.map(
  (mapping, index) => {
    const entry = CATALOG_ENTRIES[index];
    const category: CategoryName = entry?.category ?? 'Anime Action Figures';
    const basePrice = entry?.price ?? 299;
    const scale = entry?.scale ?? 'Collector Edition';
    const dimensions = entry?.dimensions ?? 'Standard Box';
    const studio = entry?.studio ?? DEFAULT_STUDIO[category];
    const title = entry?.title ?? `Kage Figures Drop #${index + 1}`;
    const editionNum = String(index + 1).padStart(3, '0');

    let sectionGroup: Product['sectionGroup'] = 'featured';
    let status: Product['status'] = 'In Stock';
    let compareAtPrice: number | undefined;

    if (index >= 95 && index < 115) {
      sectionGroup = 'sale';
      status = 'On Sale';
      compareAtPrice = Math.round((basePrice * 1.25) / 10) * 10;
    } else if (index >= 115) {
      sectionGroup = 'vault';
      status = 'Pre-Order';
    } else if (index % 5 === 0) {
      status = 'Limited';
    }

    if (entry?.soldOut) {
      status = 'Sold Out';
      compareAtPrice = undefined;
    }

    const fallbackUrl = mapping.catalogueImage || FALLBACK_BY_CATEGORY[category];
    const dropBadge = String(mapping.instagramPostIndex).padStart(3, '0');

    return {
      id: `kf-ig-${editionNum}`,
      code: `KF-${editionNum}`,
      title,
      studio,
      category,
      scale,
      dimensions,
      editionSize:
        status === 'Pre-Order'
          ? 'Vault Allocation'
          : `IG Drop #${dropBadge}`,
      price: basePrice,
      compareAtPrice,
      status,
      sectionGroup,
      imageUrl: mapping.instagramImage,
      images: mapping.images && mapping.images.length > 0 ? mapping.images : [mapping.instagramImage],
      slideUrls: mapping.slideUrls,
      fallbackUrl,
      description: `Featured on @kagefigures Instagram catalogue (Drop #${dropBadge}). Authentic ${category.toLowerCase()} piece (${dimensions}) packed securely for insured pan-India delivery.`,
      variants:
        status === 'Pre-Order'
          ? [{ id: 'full', label: 'Full Allocation', priceDelta: 0 }]
          : [{ id: 'std', label: 'Standard Edition', priceDelta: 0 }],
      instagramUrl: mapping.instagramUrl,
      instagramPostIndex: mapping.instagramPostIndex,
      instagramShortcode: mapping.instagramShortcode,
    };
  },
);

const countByCategory = (cat: CategoryName) =>
  PRODUCTS.filter((p) => p.category === cat).length;

export const COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-keychains',
    title: 'Anime Keychains',
    countLabel: `${countByCategory('Anime Keychains')} Editions`,
    description:
      'Pocket watch keychains, enamel metal rings, woven straps, and mini blade charms.',
    categoryFilter: 'Anime Keychains',
    imageUrl: keychainsCoverImg,
    fallbackUrl: keychainsCoverImg,
  },
  {
    id: 'col-action-figures',
    title: 'Anime Action Figures',
    countLabel: `${countByCategory('Anime Action Figures')} Editions`,
    description:
      'Hand-painted PVC anime statues, chibi figures, and collector dioramas.',
    categoryFilter: 'Anime Action Figures',
    imageUrl: actionFiguresCoverImg,
    fallbackUrl: actionFiguresCoverImg,
  },
  {
    id: 'col-cars',
    title: 'Cars Figures',
    countLabel: `${countByCategory('Cars Figures')} Editions`,
    description:
      'Die-cast metal pull-back supercars and 1:64 scale mini RC alloy models.',
    categoryFilter: 'Cars Figures',
    imageUrl: carsCoverImg,
    fallbackUrl: carsCoverImg,
  },
  {
    id: 'col-katana',
    title: 'Katana',
    countLabel: `${countByCategory('Katana')} Editions`,
    description:
      'Full-size anime katanas, glowing LED blades, and shinobi kunai collector sets.',
    categoryFilter: 'Katana',
    imageUrl: katanaCoverImg,
    fallbackUrl: katanaCoverImg,
  },
  {
    id: 'col-manga-frame',
    title: 'Manga Frame',
    countLabel: `${countByCategory('Manga Frame')} Editions`,
    description:
      '3D layered shadowbox frames, backlit LED frames, and hardcover anime notebooks.',
    categoryFilter: 'Manga Frame',
    imageUrl: mangaFrameCoverImg,
    fallbackUrl: mangaFrameCoverImg,
  },
];

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CATALOG_MIN_PRICE = Math.min(...PRODUCTS.map((p) => p.price));
export const CATALOG_MAX_PRICE = Math.max(...PRODUCTS.map((p) => p.price));

export interface PricePreset {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const PRICE_PRESETS: PricePreset[] = [
  {
    id: 'all',
    label: 'All Prices',
    min: CATALOG_MIN_PRICE,
    max: CATALOG_MAX_PRICE,
  },
  { id: 'under-200', label: 'Under ₹200', min: CATALOG_MIN_PRICE, max: 199 },
  { id: '200-499', label: '₹200 – ₹499', min: 200, max: 499 },
  { id: '500-999', label: '₹500 – ₹999', min: 500, max: 999 },
  { id: '1000-plus', label: '₹1,000+', min: 1000, max: CATALOG_MAX_PRICE },
];

export function getActivePriceLabel(min: number, max: number): string {
  const matched = PRICE_PRESETS.find((p) => p.min === min && p.max === max);
  if (matched) return matched.label;
  return `${formatINR(min)} – ${formatINR(max)}`;
}

