import { INSTAGRAM_CATALOGUE_URLS } from './instagramUrls';
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
  status: 'In Stock' | 'Pre-Order' | 'On Sale' | 'Limited';
  sectionGroup: 'featured' | 'sale' | 'vault';
  imageUrl: string;
  fallbackUrl: string;
  description: string;
  variants: ProductVariant[];
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
    imagePositionClass: 'object-[64%_center] md:object-center',
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
}

const CATALOG_ENTRIES: RawCatalogEntry[] = [
  // 0..4
  { title: 'One Piece Turtle Metal Keychain', price: 299, category: 'Anime Keychains', scale: 'Antique Alloy', dimensions: '6.5cm · Split Ring' },
  { title: 'Attack on Titan Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Yin Yang Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Friends Forever Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Vintage Anchor Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },

  // 5..9
  { title: 'Gojo Satoru Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Chelsea FC Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Ladybug Brass Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Son Goku Dragon Ball Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Paris Saint-Germain Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },

  // 10..14
  { title: 'PUBG Brass Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Baby Yoda Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Star Wars Darth Vader Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Fitness Dumbbell Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Death Note Rectangular Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '5cm · Chain & Box' },

  // 15..19
  { title: 'Cristiano Ronaldo 7 Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Velvet Box' },
  { title: 'Wonder Woman Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chrome Case' },
  { title: 'Superman Bronze Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Antique Brass' },
  { title: 'Vintage Roman Numeral Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Mechanical' },
  { title: 'Winged Mechanical Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },

  // 20..24
  { title: 'Survey Corps Crest Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Brass Finish' },
  { title: 'Lionel Messi 10 Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Gloss Black' },
  { title: 'Akatsuki Cloud Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Chain & Ring' },
  { title: 'Best Brother Ever Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Gift Box' },
  { title: 'Stark Direwolf Vintage Pocket Watch Keychain', price: 299, category: 'Anime Keychains', scale: 'Pocket Watch', dimensions: '4.5cm · Antique Bronze' },

  // 25..29
  { title: 'Nezuko Kamado Anime Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Kakashi Hatake Chibi Red Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Kakashi Hatake Sharingan Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Kakashi Hatake Blister Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Black Dragon Curved Anime Knife Keychain', price: 249, category: 'Anime Keychains', scale: 'Die-Cast Alloy', dimensions: '13cm · Display Ring' },

  // 30..34
  { title: 'Blue Camo Curved Anime Knife Keychain', price: 249, category: 'Anime Keychains', scale: 'Die-Cast Alloy', dimensions: '13cm · Display Ring' },
  { title: 'Silver Dragon Curved Anime Knife Keychain', price: 249, category: 'Anime Keychains', scale: 'Die-Cast Alloy', dimensions: '13cm · Display Ring' },
  { title: 'Tanjiro Kamado Water Emblem Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Chibi Samurai Round Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Monkey D. Luffy One Piece Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },

  // 35..39
  { title: 'Tanjiro Kamado Red Medallion Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Tanjiro Kamado Chibi Cutout Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Inosuke Hashibira Anime Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Uchiha Sharingan Collector Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Alloy', dimensions: '6cm · Split Ring' },
  { title: 'Straw Hat Pirates Black Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Metal Clasp' },

  // 40..44
  { title: 'Dragon Ball Z Trunks Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },
  { title: 'Naruto Uzumaki Orange Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },
  { title: 'Bleach Ichigo Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },
  { title: 'Dragon Ball Broly Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },
  { title: 'One Piece Luffy Blue Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },

  // 45..49
  { title: 'Roronoa Zoro Mini Sword Keychain', price: 109, category: 'Anime Keychains', scale: 'Alloy Mini Blade', dimensions: '16cm · Scabbard Ring' },
  { title: 'Yuji Itadori Jujutsu Kaisen Metal Keychain', price: 109, category: 'Anime Keychains', scale: 'Metal Enamel', dimensions: '6cm · Split Ring' },
  { title: 'Son Goku Dragon Ball Grey Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },
  { title: 'Roronoa Zoro Green Bag Tag Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Bag Clasp' },
  { title: 'Uchiha Itachi Akatsuki Strap Keychain', price: 109, category: 'Anime Keychains', scale: 'Woven Strap', dimensions: '14cm · Split Ring' },

  // 50..54
  { title: 'Son Goku on Motorbike Action Figure', price: 699, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Bike Diorama' },
  { title: 'Demon Slayer Dual Nichirin Sword Keychain', price: 109, category: 'Anime Keychains', scale: 'Alloy Mini Blade', dimensions: '16cm · Scabbard Ring' },
  { title: 'One Piece Gold Katana Sword Keychain', price: 109, category: 'Anime Keychains', scale: 'Alloy Mini Blade', dimensions: '15cm · Split Ring' },
  { title: 'Trasped Mini RC Car 1:64 Alloy Model (Red)', price: 1199, category: 'Cars Figures', studio: 'Trasped', scale: '1:64 Alloy RC', dimensions: 'App & Remote · USB-C' },
  { title: 'Monkey D. Luffy Classic Red Vest Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },

  // 55..59
  { title: 'Son Goku Super Saiyan Blue Action Figure', price: 199, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Kakashi Hatake Copy Ninja Action Figure', price: 749, category: 'Anime Action Figures', scale: '24cm PVC', dimensions: 'H 24cm · Scenic Base' },
  { title: 'Black Matte Supercar 1:32 Die-Cast Car', price: 349, category: 'Cars Figures', studio: 'AutoArt', scale: '1:32 Die-Cast', dimensions: 'L 15cm · Opening Doors' },
  { title: 'Mercedes AMG Silver Metal Pull-Back Car', price: 449, category: 'Cars Figures', studio: 'Bburago', scale: '1:32 Die-Cast', dimensions: 'L 15cm · Pull-Back' },
  { title: 'Mini RC Car 1:64 Scale Alloy Box Set', price: 1199, category: 'Cars Figures', studio: 'Trasped', scale: '1:64 Alloy RC', dimensions: '2.4GHz Remote · LED' },

  // 60..64
  { title: 'Blue Track Supercar 1:32 Die-Cast Car', price: 349, category: 'Cars Figures', studio: 'Mini GT', scale: '1:32 Die-Cast', dimensions: 'L 15cm · Metal Body' },
  { title: 'Naruto Uzumaki Spiral Collector Notebook', price: 199, category: 'Manga Frame', studio: 'InkFrame Studio', scale: 'A5 Hardcover', dimensions: '21×15cm · Manga Art' },
  { title: 'Demon Slayer Mini Katana Keychain', price: 249, category: 'Anime Keychains', scale: 'Metal Scabbard', dimensions: '17cm · Blister Card' },
  { title: 'Naruto Shinobi Kunai 3-Piece Collector Set', price: 499, category: 'Katana', studio: 'Shinobi Blade', scale: 'Collector Set', dimensions: 'Kunai Trio + Headband' },
  { title: 'Naruto Uzumaki Seventh Hokage Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },

  // 65..69
  { title: 'Agatsuma Zenitsu Chibi Fridge Magnet', price: 199, category: 'Anime Keychains', scale: 'Acrylic Magnet', dimensions: '8cm · Gloss Print' },
  { title: 'Monkey D. Luffy Straw Hat Captain Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Minato Namikaze Fourth Hokage Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Zenitsu Flame Sword Collector Notebook', price: 199, category: 'Manga Frame', studio: 'InkFrame Studio', scale: 'A5 Hardcover', dimensions: '21×15cm · Gloss Print' },
  { title: 'Gaara of the Sand Collectible Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },

  // 70..74
  { title: 'Kakashi Hatake Leaf Vest Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Deidara Akatsuki Cloak Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Uchiha Sasuke Collector Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Naruto Uzumaki Hokage Cape Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Nezuko Kamado 3D Layered Manga Frame', price: 399, category: 'Manga Frame', studio: 'Mono Shadowbox', scale: '3D Wall Frame', dimensions: '25×20cm · Matte White' },

  // 75..79
  { title: 'Naruto Uzumaki Sage Mode Glow Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Agatsuma Zenitsu LED Manga Lightbox Frame', price: 499, category: 'Manga Frame', studio: 'Kage Gallery', scale: 'LED Shadowbox', dimensions: '24×18cm · USB Warm LED' },
  { title: 'Monkey D. Luffy Gear 5 Cloud Sitting Figure', price: 249, category: 'Anime Action Figures', scale: '16cm PVC', dimensions: 'H 16cm · Display Stand' },
  { title: 'Son Goku Flying Nimbus Action Figure', price: 399, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Nimbus Base' },
  { title: 'Monkey D. Luffy Gear 5 Dynamic Leap Figure', price: 249, category: 'Anime Action Figures', scale: '16cm PVC', dimensions: 'H 16cm · Display Stand' },

  // 80..84
  { title: 'Monkey D. Luffy Gear 5 Standing Figure', price: 499, category: 'Anime Action Figures', scale: '21cm PVC', dimensions: 'H 21cm · Lightning Effect' },
  { title: 'Monkey D. Luffy Gear 5 Mid-Air Kick Figure', price: 249, category: 'Anime Action Figures', scale: '16cm PVC', dimensions: 'H 16cm · Display Stand' },
  { title: 'Akatsuki & Sharingan Anime Rings Box Set', price: 499, category: 'Anime Keychains', scale: 'Collector Ring Set', dimensions: '10 Rings + Necklace Chain' },
  { title: 'Demon Slayer Kimetsu no Yaiba Manga Vol. 1', price: 299, category: 'Manga Frame', studio: 'Shonen Print', scale: 'Paperback Manga', dimensions: 'Original Manga Volume 1' },
  { title: 'Berserk Dark Knight Collector Statue', price: 1499, category: 'Anime Action Figures', studio: 'Kage Studio', scale: '28cm Collector', dimensions: 'H 28cm · Stone Base' },

  // 85..89
  { title: 'Uchiha Sasuke Chidori 24cm Premium Figure', price: 999, category: 'Anime Action Figures', studio: 'Kage Studio', scale: '24cm PVC', dimensions: 'H 24cm · Chakra Base' },
  { title: 'Kyojuro Rengoku Flame Hashira Figure', price: 649, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Flame Effect' },
  { title: 'Princess Shirahoshi One Piece Figure', price: 999, category: 'Anime Action Figures', studio: 'Banpresto', scale: '23cm PVC', dimensions: 'H 23cm · Coral Base' },
  { title: 'Megumi Fushiguro Jujutsu Kaisen Figure', price: 999, category: 'Anime Action Figures', studio: 'Bandai Tamashii', scale: '22cm PVC', dimensions: 'H 22cm · Battle Stance' },
  { title: 'Zenitsu Agatsuma Chibi Mobile Holder Figure', price: 349, category: 'Anime Action Figures', scale: '12cm Chibi', dimensions: 'H 12cm · Phone Dock' },

  // 90..95
  { title: 'Shenron Eternal Dragon Collector Statue', price: 1499, category: 'Anime Action Figures', studio: 'Kage Studio', scale: '28cm Diorama', dimensions: 'H 28cm · 7 Dragon Balls' },
  { title: 'Chisato Nishikigi Aqua Float Girls Figure', price: 699, category: 'Anime Action Figures', studio: 'Taito', scale: '20cm PVC', dimensions: 'H 20cm · Swim Ring' },
  { title: 'Zenitsu Thunderclap White Manga Frame', price: 499, category: 'Manga Frame', studio: 'Kage Gallery', scale: 'Thick Shadowbox', dimensions: '25×20cm · White Frame' },
  { title: 'Rem Celestial Vivi Swimsuit Ver. Figure', price: 699, category: 'Anime Action Figures', studio: 'Banpresto', scale: '20cm PVC', dimensions: 'H 20cm · Beach Base' },
  { title: 'Muzan Kibutsuji Demon Form Action Figure', price: 999, category: 'Anime Action Figures', studio: 'Kage Studio', scale: '25cm PVC', dimensions: 'H 25cm · Blood Whip Base' },
  { title: 'Tanjiro Kamado Water Breathing Action Figure', price: 749, category: 'Anime Action Figures', scale: '22cm PVC', dimensions: 'H 22cm · Water Dragon FX' },

  // 96..115 (On Sale showcase)
  { title: 'Tanjiro Kamado Water Dragon Action Figure', price: 749, category: 'Anime Action Figures', scale: '22cm PVC', dimensions: 'H 22cm · Water Spiral' },
  { title: 'Goku & Vegeta SSB Collector A5 Notebook', price: 199, category: 'Manga Frame', studio: 'InkFrame Studio', scale: 'A5 Hardcover', dimensions: '21×15cm · Smooth Paper' },
  { title: 'Sanemi Shinazugawa Katana (Without Light)', price: 1499, category: 'Katana', studio: 'Kyoto Armory', scale: '104cm Full Size', dimensions: '104cm · Black Scabbard' },
  { title: 'Sanemi Shinazugawa Green LED Light Katana', price: 1999, category: 'Katana', studio: 'Kyoto Armory', scale: '104cm LED Katana', dimensions: '104cm · Glowing Blade' },
  { title: 'One Piece Grand Hourglass Pirate Edition', price: 499, category: 'Anime Action Figures', studio: 'Kage Craft', scale: 'Desk Diorama', dimensions: 'H 16cm · Thousand Sunny' },
  { title: 'Kento Nanami Jujutsu Kaisen Chibi Figure', price: 349, category: 'Anime Action Figures', scale: '12cm PVC', dimensions: 'H 12cm · Scenic Stand' },
  { title: 'Satoru Gojo Chibi Purple Technique Figure', price: 349, category: 'Anime Action Figures', scale: '12cm PVC', dimensions: 'H 12cm · Purple Aura' },
  { title: 'Ryomen Sukuna Malevolent Throne Figure', price: 349, category: 'Anime Action Figures', scale: '13cm PVC', dimensions: 'H 13cm · Skull Throne' },
  { title: 'Suguru Geto Jujutsu Kaisen Chibi Figure', price: 249, category: 'Anime Action Figures', scale: '11cm PVC', dimensions: 'H 11cm · Round Base' },
  { title: 'Megumi Fushiguro Divine Canine Figure', price: 349, category: 'Anime Action Figures', scale: '13cm PVC', dimensions: 'H 13cm · Wolf Base' },
  { title: 'Yuji Itadori Black Flash Unleashed Figure', price: 349, category: 'Anime Action Figures', scale: '13cm PVC', dimensions: 'H 13cm · Red FX' },
  { title: 'Megumi Fushiguro with Divine Wolf Figure', price: 249, category: 'Anime Action Figures', scale: '12cm PVC', dimensions: 'H 12cm · Blue Aura Base' },
  { title: 'Nobara Kugisaki Nail Strike Action Figure', price: 349, category: 'Anime Action Figures', scale: '13cm PVC', dimensions: 'H 13cm · Dynamic Stand' },
  { title: 'Satoru Gojo Blindfold Chibi Figure', price: 249, category: 'Anime Action Figures', scale: '11cm PVC', dimensions: 'H 11cm · Display Stand' },
  { title: 'Yuji Itadori Crimson Scroll Edition Figure', price: 249, category: 'Anime Action Figures', scale: '11cm PVC', dimensions: 'H 11cm · Display Stand' },
  { title: 'Nobara Kugisaki Hammer Pose Chibi Figure', price: 249, category: 'Anime Action Figures', scale: '11cm PVC', dimensions: 'H 11cm · Display Stand' },
  { title: 'Son Goku Ultra Instinct Sign Action Figure', price: 199, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Futuristic Cyber LED Spark Katana', price: 999, category: 'Katana', studio: 'Kage Forge', scale: '80cm LED Blade', dimensions: 'RGB Blade · Smoke & Spark' },
  { title: 'Monkey D. Luffy Wano Kuni Ver. Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Kimono Pose' },
  { title: 'Monkey D. Luffy Future King Action Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },

  // 116..137 (Collector's Vault)
  { title: 'Monkey D. Luffy Straw Hat Pirate Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Harbour Base' },
  { title: 'One Piece Luffy Blue Waist Sash Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Monkey D. Luffy Red Coat Captain Figure', price: 299, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Son Goku Super Saiyan Blue Chibi Figure', price: 249, category: 'Anime Action Figures', scale: '12cm PVC', dimensions: 'H 12cm · Display Stand' },
  { title: 'Monkey D. Luffy Gear 5 Cloud Base Figure', price: 499, category: 'Anime Action Figures', scale: '19cm PVC', dimensions: 'H 19cm · Cloud Base' },
  { title: 'Portgas D. Ace Fire Fist Action Figure', price: 599, category: 'Anime Action Figures', scale: '21cm PVC', dimensions: 'H 21cm · Flame Effects' },
  { title: 'Vegeta Ultra Ego God of Pride Figure', price: 199, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Tanjiro Kamado Water Breathing Slash Figure', price: 599, category: 'Anime Action Figures', scale: '21cm PVC', dimensions: 'H 21cm · Wave Base' },
  { title: 'Son Goku Super Saiyan Classic Figure', price: 199, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Son Goku Kaio-Ken Muscle Aura Figure', price: 648, category: 'Anime Action Figures', scale: '22cm PVC', dimensions: 'H 22cm · Crimson Aura' },
  { title: 'Nezuko Kamado Demon Form Action Figure', price: 499, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Horn & Markings' },
  { title: 'Mitsuri Kanroji Love Hashira Action Figure', price: 499, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Whip Katana' },
  { title: 'Son Goku Base Form Martial Action Figure', price: 499, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Display Base' },
  { title: 'Tanjiro Kamado Water Dragon Surge Figure', price: 699, category: 'Anime Action Figures', scale: '22cm PVC', dimensions: 'H 22cm · Translucent Dragon' },
  { title: 'Son Goku Power Saiyan Action Figure', price: 199, category: 'Anime Action Figures', scale: '18cm PVC', dimensions: 'H 18cm · Display Base' },
  { title: 'Dragon Legends Goku & Shenron Diorama', price: 1199, category: 'Anime Action Figures', studio: 'Kage Studio', scale: '26cm Diorama', dimensions: 'H 26cm · Scenic Cloud' },
  { title: 'Muichiro Tokito Mist Hashira Figure', price: 499, category: 'Anime Action Figures', scale: '19cm PVC', dimensions: 'H 19cm · Nichirin Pose' },
  { title: 'Giyu Tomioka Water Hashira Action Figure', price: 699, category: 'Anime Action Figures', scale: '21cm PVC', dimensions: 'H 21cm · Splash Base' },
  { title: 'Tanjiro Kamado Hinokami Kagura Figure', price: 699, category: 'Anime Action Figures', scale: '21cm PVC', dimensions: 'H 21cm · Dynamic Slash' },
  { title: 'Agatsuma Zenitsu Thunder Breathing Figure', price: 699, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Lightning Base' },
  { title: 'Shinobu Kocho Insect Hashira Action Figure', price: 699, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Butterfly FX' },
  { title: 'Nezuko Kamado Demon Slayer Display Figure', price: 699, category: 'Anime Action Figures', scale: '20cm PVC', dimensions: 'H 20cm · Display Base' },
];

const DEFAULT_STUDIO: Record<CategoryName, string> = {
  'Anime Keychains': 'Kage Craft',
  'Anime Action Figures': 'Kage Studio',
  'Cars Figures': 'AutoArt',
  Katana: 'Kage Forge',
  'Manga Frame': 'Kage Gallery',
};

export const PRODUCTS: Product[] = INSTAGRAM_CATALOGUE_URLS.map(
  (_url, index) => {
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

    if (index >= 96 && index < 116) {
      sectionGroup = 'sale';
      status = 'On Sale';
      compareAtPrice = Math.round((basePrice * 1.25) / 10) * 10;
    } else if (index >= 116) {
      sectionGroup = 'vault';
      status = 'Pre-Order';
    } else if (index % 5 === 0) {
      status = 'Limited';
    }

    const fallbackUrl = FALLBACK_BY_CATEGORY[category];

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
          : `IG Drop #${editionNum}`,
      price: basePrice,
      compareAtPrice,
      status,
      sectionGroup,
      imageUrl: igImg(index),
      fallbackUrl,
      description: `Featured on @kage.figures Instagram catalogue (Drop #${editionNum}). Authentic ${category.toLowerCase()} piece (${dimensions}) packed securely for insured pan-India delivery.`,
      variants:
        status === 'Pre-Order'
          ? [{ id: 'full', label: 'Full Allocation', priceDelta: 0 }]
          : [{ id: 'std', label: 'Standard Edition', priceDelta: 0 }],
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

