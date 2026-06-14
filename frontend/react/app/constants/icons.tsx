import { Key } from "react";
import { AppIconProps } from "../components/AppIcon";

const ICON_KEYS = ["ACCOUNT_TYPE", "CATEGORY_ICONS"] as const;

export const ICONS: Record<(typeof ICON_KEYS)[number], AppIconProps["name"][]> =
  {
    ACCOUNT_TYPE: [
      "Wallet",
      "WalletCards",
      "WalletMinimal",
      "Coins",
      "Bitcoin",
      "CirclePoundSterling",
      "CircleDollarSign",
      "DollarSign",
      "Euro",
      "BadgeCent",
      "BadgeDollarSign",
      "BadgeEuro",
      "BadgeJapaneseYen",
      "Banknote",
      "BanknoteArrowDown",
      "BanknoteArrowUp",
      "BanknoteX",
      "CreditCard",
      "Landmark",
      "Vault",
      "HandCoins",
      "PiggyBank",
    ],
    CATEGORY_ICONS: [
      "Utensils", // Food
      "Coffee", // Drinks
      "ShoppingBag", // Shopping
      "Shirt", // Clothing
      "Car", // Transport
      "Bus", // Public Transport
      "Fuel", // Petrol
      "House", // Rent
      // "Home", // Home Expenses
      "Building2", // Utilities
      "Lightbulb", // Electricity
      "Droplets", // Water Bill
      "Wifi", // Internet
      "Smartphone", // Mobile Bill
      "Tv", // Entertainment
      "Film", // Movies
      "Gamepad2", // Gaming
      "Music", // Music
      "Book", // Education
      "GraduationCap", // Study
      "Briefcase", // Work
      "Laptop", // Technology
      "Monitor", // Electronics
      "Wrench", // Maintenance
      "HeartPulse", // Medical
      "Pill", // Medicine
      "Dumbbell", // Fitness
      "Plane", // Travel
      "Map", // Vacation
      "Gift", // Gifts
      "PartyPopper", // Celebration
      "Users", // Family
      "Baby", // Children
      "Dog", // Pets
      "Church", // Donation
      "Handshake", // Charity
      "Receipt", // Bills
      "FileText", // Tax
      "Shield", // Insurance
      "CircleEllipsis", // Others
    ],
  };
