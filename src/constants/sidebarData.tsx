import {
  OverviewIcon,
  MatchIcon,
  NotificationsIcon,
  TeamIcon,
  PlayerIcon,
  EngtvIcon,
  TransferIcon,
  UserManagementIcon,
  SettingsIcon,
  TableIcon,
  NewsIcon,
  Terms,
  Privacy,
  Subscribe,
  Reward
} from "@/assets/assets";

export type TMenuItem = {
  id: number;
  icon: React.ElementType;
  title: string;
  label: string;
};


export const sidebarData: TMenuItem[] = [
  {
    id: 1,
    icon: OverviewIcon,
    title: "Overview",
    label: "/",
  },
  {
    id: 2,
    icon: MatchIcon,
    title: "Match Management",
    label: "/match-management",
  },
  {
    id: 3,
    icon: TableIcon,
    title: "Table Management",
    label: "/table-management",
  },
  {
    id: 4,
    icon: TeamIcon,
    title: "Team Management",
    label: "/team-management",
  },
  {
    id: 5,
    icon: PlayerIcon,
    title: "Player Management",
    label: "/player-management",
  },
  {
    id: 6,
    icon: TransferIcon,
    title: "Transfer Management",
    label: "/transfer-management",
  },
  {
    id: 7,
    icon: EngtvIcon,
    title: "ENG TV Management",
    label: "/engtv-management",
  },
  {
    id: 8,
    icon: NewsIcon,
    title: "News Management",
    label: "/news-management",
  },
  {
    id: 9,
    icon: UserManagementIcon,
    title: "User Management",
    label: "/user-management",
  },
  {
    id: 10,
    icon: NotificationsIcon,
    title: "Notifications",
    label: "/notifications",
  },
  {
    id: 11,
    icon: Subscribe,
    title: "Subscribe Plan",
    label: "/subscribe-plan",
  },
  {
    id: 12,
    icon: Reward,
    title: "Rewards/Redemption",
    label: "/rewards-redemption",
  },
  {
    id: 13,
    icon: SettingsIcon,
    title: "Settings",
    label: "/settings",
  },
  {
    id: 14,
    icon: Terms,
    title: "Terms & Condition",
    label: "/terms-and-condition",
  },
  {
    id: 15,
    icon: Privacy,
    title: "Privacy Policy",
    label: "/privacy-policy",
  },
];