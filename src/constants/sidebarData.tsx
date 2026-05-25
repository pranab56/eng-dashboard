import {
  EngtvIcon,
  MatchIcon,
  NewsIcon,
  NotificationsIcon,
  OverviewIcon,
  PlayerIcon,
  Privacy,
  Reward,
  SettingsIcon,
  Subscribe,
  TableIcon,
  TeamIcon,
  Terms,
  TransferIcon,
  UserManagementIcon
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
    icon: MatchIcon,
    title: "League Management",
    label: "/league-management",
  },

  {
    id: 4,
    icon: TeamIcon,
    title: "Team Management",
    label: "/team-management",
  },
  {
    id: 5,
    icon: MatchIcon,
    title: "League Team",
    label: "/league-team",
  },
  {
    id: 6,
    icon: TableIcon,
    title: "Table Management",
    label: "/table-management",
  },
  {
    id: 7,
    icon: PlayerIcon,
    title: "Player Management",
    label: "/player-management",
  },
  {
    id: 8,
    icon: TransferIcon,
    title: "Transfer Management",
    label: "/transfer-management",
  },
  {
    id: 9,
    icon: EngtvIcon,
    title: "ENG TV Management",
    label: "/engtv-management",
  },
  {
    id: 10,
    icon: NewsIcon,
    title: "News Management",
    label: "/news-management",
  },

  {
    id: 11,
    icon: NewsIcon,
    title: "Event Management",
    label: "/event-management",
  },
  {
    id: 12,
    icon: UserManagementIcon,
    title: "User Management",
    label: "/user-management",
  },
  {
    id: 13,
    icon: NotificationsIcon,
    title: "Notifications",
    label: "/notifications",
  },
  {
    id: 14,
    icon: Subscribe,
    title: "Subscribe Plan",
    label: "/subscribe-plan",
  },
  {
    id: 15,
    icon: Reward,
    title: "Rewards/Redemption",
    label: "/rewards-redemption",
  },
  {
    id: 16,
    icon: SettingsIcon,
    title: "Settings",
    label: "/profile",
  },
  {
    id: 17,
    icon: Terms,
    title: "Terms & Condition",
    label: "/terms-and-condition",
  },
  {
    id: 18,
    icon: Privacy,
    title: "Privacy Policy",
    label: "/privacy-policy",
  },
];