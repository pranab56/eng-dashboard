export interface IPermissionOption {
  key: string;
  label: string;
  route: string;
  category: string;
  description: string;
}

export const AVAILABLE_PERMISSIONS: IPermissionOption[] = [
  {
    key: "OVERVIEW",
    label: "Overview / Dashboard",
    route: "/",
    category: "General",
    description: "Access to main dashboard metrics and activity overview",
  },
  {
    key: "MATCH_MANAGEMENT",
    label: "Match Management",
    route: "/match-management",
    category: "Competitions",
    description: "Manage matches, fixtures, live scoring, and match events",
  },
  {
    key: "LEAGUE_MANAGEMENT",
    label: "League Management",
    route: "/league-management",
    category: "Competitions",
    description: "Manage leagues, seasons, and divisions",
  },
  {
    key: "TOURNAMENTS",
    label: "Tournaments",
    route: "/tournaments",
    category: "Competitions",
    description: "Manage cup tournaments and brackets",
  },
  {
    key: "TOURNAMENT_CLAIM",
    label: "Tournament Claim",
    route: "/tournament-claim",
    category: "Competitions",
    description: "Process tournament reward and trophy claims",
  },
  {
    key: "TABLE_MANAGEMENT",
    label: "Table Management",
    route: "/table-management",
    category: "Competitions",
    description: "View and edit standings and league points tables",
  },
  {
    key: "TEAM_MANAGEMENT",
    label: "Team Management",
    route: "/team-management",
    category: "Clubs & Players",
    description: "Manage registered clubs, teams, and budgets",
  },
  {
    key: "LEAGUE_TEAM",
    label: "League Team",
    route: "/league-team",
    category: "Clubs & Players",
    description: "Assign and organize teams in leagues",
  },
  {
    key: "PLAYER_MANAGEMENT",
    label: "Player Management",
    route: "/player-management",
    category: "Clubs & Players",
    description: "Manage players, registrations, stats, and economy",
  },
  {
    key: "PARENT_MANAGEMENT",
    label: "Parent Management",
    route: "/parent-management",
    category: "Clubs & Players",
    description: "Manage parent accounts and linked child players",
  },
  {
    key: "TRANSFER_MANAGEMENT",
    label: "Transfer Management",
    route: "/transfer-management",
    category: "Clubs & Players",
    description: "Review and approve player transfer requests",
  },
  {
    key: "USER_MANAGEMENT",
    label: "User Management",
    route: "/user-management",
    category: "Users & Plans",
    description: "Manage all system user accounts and roles",
  },
  {
    key: "INCOMPLETE_ACCOUNTS",
    label: "Incomplete Accounts",
    route: "/incomplete-accounts",
    category: "Users & Plans",
    description: "Monitor and verify incomplete registration accounts",
  },
  {
    key: "SUBSCRIBE_PLAN",
    label: "Subscribe Plan",
    route: "/subscribe-plan",
    category: "Users & Plans",
    description: "Configure pricing tiers and subscription packages",
  },
  {
    key: "PUSH_NOTIFICATION",
    label: "Push Notification",
    route: "/push-notification",
    category: "Media & Content",
    description: "Send push alerts and announcements to mobile users",
  },
  {
    key: "ENGTV_MANAGEMENT",
    label: "ENG TV Management",
    route: "/engtv-management",
    category: "Media & Content",
    description: "Upload and organize video streaming broadcasts",
  },
  {
    key: "NEWS_MANAGEMENT",
    label: "News Management",
    route: "/news-management",
    category: "Media & Content",
    description: "Publish news articles, reports, and press releases",
  },
  {
    key: "EVENT_MANAGEMENT",
    label: "Event Management",
    route: "/event-management",
    category: "Media & Content",
    description: "Manage training camps and special club events",
  },
  {
    key: "GALLERY",
    label: "Gallery",
    route: "/gallery",
    category: "Media & Content",
    description: "Organize official event photo albums and assets",
  },
  {
    key: "SOCIAL_MEDIA",
    label: "Social Media",
    route: "/social-media",
    category: "Media & Content",
    description: "Manage social channel feeds and official links",
  },
  {
    key: "REWARDS_REDEMPTION",
    label: "Rewards / Redemption",
    route: "/rewards-redemption",
    category: "Rewards & Orders",
    description: "Manage coin reward products in the club store",
  },
  {
    key: "ORDER_MANAGEMENT",
    label: "Order Management",
    route: "/order-management",
    category: "Rewards & Orders",
    description: "Fulfill player physical product orders and claims",
  },
  {
    key: "CATEGORY_MANAGEMENT",
    label: "Category Management",
    route: "/category-management",
    category: "System & Settings",
    description: "Configure venues, playtimes, age groups, and categories",
  },
  {
    key: "SERVER_HEALTH",
    label: "Server Health",
    route: "/server-health",
    category: "System & Settings",
    description: "Monitor real-time system resources, server metrics, and Winston logs",
  },
  {
    key: "SETTINGS",
    label: "Settings",
    route: "/settings",
    category: "System & Settings",
    description: "Manage system profile and legal policies",
  },
];

export const PERMISSION_CATEGORIES = Array.from(
  new Set(AVAILABLE_PERMISSIONS.map((p) => p.category))
);

export const getFirstPermittedRoute = (
  permissions?: string[] | null,
  role?: string | null
): string => {
  const normalizedRole = (role || "").toUpperCase();
  if (normalizedRole === "SUPER_ADMIN") return "/";

  if (!permissions || permissions.length === 0) {
    return "/"; // Fallback for legacy full admins
  }

  // Find first permission that has a route
  for (const permKey of permissions) {
    const match = AVAILABLE_PERMISSIONS.find((p) => p.key === permKey);
    if (match) return match.route;
  }

  return "/";
};

export const isRouteAllowedForAdmin = (
  pathname: string,
  permissions?: string[] | null,
  role?: string | null
): boolean => {
  const normalizedRole = (role || "").toUpperCase();
  if (normalizedRole === "SUPER_ADMIN") return true;

  // If no granular permissions set yet, allow all
  if (!permissions || permissions.length === 0) return true;

  // Overview / root
  if (pathname === "/") {
    return permissions.includes("OVERVIEW");
  }

  // User profile is accessible by all authenticated admins
  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return true;
  }

  // Server health route
  if (pathname === "/server-health" || pathname.startsWith("/server-health/")) {
    return permissions.includes("SERVER_HEALTH");
  }

  // Settings subroutes: /settings, /terms-and-condition, /privacy-policy
  if (
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/terms-and-condition" ||
    pathname.startsWith("/terms-and-condition/") ||
    pathname === "/privacy-policy" ||
    pathname.startsWith("/privacy-policy/")
  ) {
    return permissions.includes("SETTINGS");
  }

  // Check matching permission
  const match = AVAILABLE_PERMISSIONS.find((p) => {
    if (p.route === "/") return false;
    return pathname === p.route || pathname.startsWith(`${p.route}/`);
  });

  // If page is not in the permission list, deny access
  if (!match) return false;

  return permissions.includes(match.key);
};
