import {
  BadgeCent,
  BadgeDollarSign,
  BadgeEuro,
  BadgeJapaneseYen,
  Banknote,
  BanknoteArrowDown,
  BanknoteArrowUp,
  BanknoteX,
  Bitcoin,
  CircleDollarSign,
  CirclePoundSterling,
  Coins,
  CreditCard,
  DollarSign,
  Euro,
  HandCoins,
  Landmark,
  PiggyBank,
  Vault,
  Wallet,
  WalletCards,
  WalletMinimal,
} from "lucide-react-native";
import { AppListCardItemType } from "../components/AppListCardView";

export const ACCOUNT_TYPE_ICONS: Pick<AppListCardItemType, "id" | "icon">[] = [
  {
    id: "Wallet",
    icon: Wallet,
  },
  {
    id: "WalletCards",
    icon: WalletCards,
  },
  {
    id: "WalletMinimal",
    icon: WalletMinimal,
  },
  {
    id: "coins",
    icon: Coins,
  },
  {
    id: "Bitcoin",
    icon: Bitcoin,
  },
  {
    id: "CirclePoundSterling",
    icon: CirclePoundSterling,
  },
  {
    id: "CircleDollarSign",
    icon: CircleDollarSign,
  },
  {
    id: "DollarSign",
    icon: DollarSign,
  },
  {
    id: "Euro",
    icon: Euro,
  },
  {
    id: "BadgeCent",
    icon: BadgeCent,
  },
  {
    id: "BadgeDollarSign",
    icon: BadgeDollarSign,
  },
  {
    id: "BadgeEuro",
    icon: BadgeEuro,
  },
  {
    id: "BadgeJapaneseYen",
    icon: BadgeJapaneseYen,
  },
  {
    id: "Banknote",
    icon: Banknote,
  },
  {
    id: "BanknoteArrowDown",
    icon: BanknoteArrowDown,
  },
  {
    id: "BanknoteArrowUp",
    icon: BanknoteArrowUp,
  },
  {
    id: "BanknoteX",
    icon: BanknoteX,
  },
  {
    id: "CreditCard",
    icon: CreditCard,
  },
  {
    id: "Landmark",
    icon: Landmark,
  },
  {
    id: "Vault",
    icon: Vault,
  },
  {
    id: "HandCoins",
    icon: HandCoins,
  },
  {
    id: "PiggyBank",
    icon: PiggyBank,
  },
];
