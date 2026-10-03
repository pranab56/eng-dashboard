/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  LayoutDashboard,
  Swords,
  Trophy,
  Medal,
  ClipboardCheck,
  Table2,
  Shield,
  Users,
  UserCheck,
  UsersRound,
  ArrowLeftRight,
  ShieldCheck,
  UserCog,
  UserMinus,
  CreditCard,
  Bell,
  Tv,
  Newspaper,
  Calendar,
  Image as ImageIcon,
  Share2,
  Sparkles,
  ShoppingBag,
  FolderTree,
  Activity,
  Settings,
  Sliders,
  User,
  FileText,
} from "lucide-react";

/**
 * Supported User Roles in ENG System
 */
export type TUserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "REFEREE"
  | "OTHER_CLUBS"
  | "PLAYER"
  | "TOURNAMENT_PLAYER";

export type TSubMenuItem = {
  id: number | string;
  icon?: React.ElementType;
  title: string;
  label: string;
  allowedRoles?: string[];
  requiredPermission?: string;
};

export type TMenuItem = {
  id: number | string;
  icon: React.ElementType;
  title: string;
  label?: string;
  children?: TSubMenuItem[];
  badge?: string | number;
  allowedRoles?: string[];
  requiredPermission?: string;
};

export type TSidebarSection = {
  id: string;
  title: string;
  items: TMenuItem[];
  allowedRoles?: string[];
};

/**
 * Evaluates whether an authenticated user role/permissions have access to an item.
 * SUPER_ADMIN has access to all administrative modules.
 */
export function hasRoleOrPermission(
  userRole?: string | null,
  userPermissions?: string[] | null,
  allowedRoles?: string[],
  requiredPermission?: string
): boolean {
  if (!userRole) return false;

  // SUPER_ADMIN has bypass authority over all menus
  if (userRole === "SUPER_ADMIN") return true;

  // If specific roles are required, ensure user's role is in the whitelist
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return false;
    }
  }

  // If a specific permission is required, verify user has it
  if (requiredPermission) {
    if (!Array.isArray(userPermissions) || !userPermissions.includes(requiredPermission)) {
      return false;
    }
  }

  return true;
}

/**
 * Filters the sidebar sections based on role and active permissions
 */
export function getAuthorizedNavigation(
  sections: TSidebarSection[],
  userRole?: string | null,
  userPermissions?: string[] | null
): TSidebarSection[] {
  const activeRole = userRole || "";

  return sections
    .map((section) => {
      // Check section-level role restrictions if defined
      if (section.allowedRoles && section.allowedRoles.length > 0) {
        if (!section.allowedRoles.includes(activeRole) && activeRole !== "SUPER_ADMIN") {
          return null;
        }
      }

      const authorizedItems = section.items
        .map((item) => {
          // If item has children, check access to child items
          if (item.children && item.children.length > 0) {
            // First check parent permission/role
            if (!hasRoleOrPermission(activeRole, userPermissions, item.allowedRoles, item.requiredPermission)) {
              return null;
            }

            const accessibleChildren = item.children.filter((child) =>
              hasRoleOrPermission(activeRole, userPermissions, child.allowedRoles, child.requiredPermission)
            );

            if (accessibleChildren.length === 0) return null;

            return {
              ...item,
              children: accessibleChildren,
            };
          }

          // Single menu item
          if (!hasRoleOrPermission(activeRole, userPermissions, item.allowedRoles, item.requiredPermission)) {
            return null;
          }

          return item;
        })
        .filter((item): item is TMenuItem => item !== null);

      if (authorizedItems.length === 0) return null;

      return {
        ...section,
        items: authorizedItems,
      };
    })
    .filter((section): section is TSidebarSection => section !== null);
}

/**
 * Enterprise Navigation Configuration
 */
export const sidebarSections: TSidebarSection[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      {
        id: 1,
        icon: LayoutDashboard,
        title: "Overview",
        label: "/",
        requiredPermission: "OVERVIEW",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "REFEREE"],
      },
    ],
  },
  {
    id: "competitions",
    title: "Matches & Tournaments",
    items: [
      {
        id: 2,
        icon: Swords,
        title: "Match Management",
        label: "/match-management",
        requiredPermission: "MATCH_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "REFEREE", "MANAGER"],
      },
      {
        id: 3,
        icon: Trophy,
        title: "League Management",
        label: "/league-management",
        requiredPermission: "LEAGUE_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 31,
        icon: Medal,
        title: "Tournaments",
        label: "/tournaments",
        requiredPermission: "TOURNAMENTS",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 32,
        icon: ClipboardCheck,
        title: "Tournament Claim",
        label: "/tournament-claim",
        requiredPermission: "TOURNAMENT_CLAIM",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 6,
        icon: Table2,
        title: "Table Management",
        label: "/table-management",
        requiredPermission: "TABLE_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "REFEREE"],
      },
    ],
  },
  {
    id: "teams",
    title: "Clubs & Players",
    items: [
      {
        id: 4,
        icon: Shield,
        title: "Team Management",
        label: "/team-management",
        requiredPermission: "TEAM_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 5,
        icon: Users,
        title: "League Team",
        label: "/league-team",
        requiredPermission: "LEAGUE_TEAM",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 7,
        icon: UserCheck,
        title: "Player Management",
        label: "/player-management",
        requiredPermission: "PLAYER_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 71,
        icon: UsersRound,
        title: "Parent Management",
        label: "/parent-management",
        requiredPermission: "PARENT_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 8,
        icon: ArrowLeftRight,
        title: "Transfer Management",
        label: "/transfer-management",
        requiredPermission: "TRANSFER_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
    ],
  },
  {
    id: "users",
    title: "Users & Plans",
    items: [
      {
        id: 112,
        icon: ShieldCheck,
        title: "Admin Management",
        label: "/admin-management",
        allowedRoles: ["SUPER_ADMIN"],
      },
      {
        id: 11,
        icon: UserCog,
        title: "User Management",
        label: "/user-management",
        requiredPermission: "USER_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 111,
        icon: UserMinus,
        title: "Incomplete Accounts",
        label: "/incomplete-accounts",
        requiredPermission: "INCOMPLETE_ACCOUNTS",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 14,
        icon: CreditCard,
        title: "Subscribe Plan",
        label: "/subscribe-plan",
        requiredPermission: "SUBSCRIBE_PLAN",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    id: "media",
    title: "Media & Content",
    items: [
      {
        id: 131,
        icon: Bell,
        title: "Push Notification",
        label: "/push-notification",
        requiredPermission: "PUSH_NOTIFICATION",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 9,
        icon: Tv,
        title: "ENG TV Management",
        label: "/engtv-management",
        requiredPermission: "ENGTV_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 10,
        icon: Newspaper,
        title: "News Management",
        label: "/news-management",
        requiredPermission: "NEWS_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 12,
        icon: Calendar,
        title: "Event Management",
        label: "/event-management",
        requiredPermission: "EVENT_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 17,
        icon: ImageIcon,
        title: "Gallery",
        label: "/gallery",
        requiredPermission: "GALLERY",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 18,
        icon: Share2,
        title: "Social Media",
        label: "/social-media",
        requiredPermission: "SOCIAL_MEDIA",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    id: "commerce",
    title: "Rewards & Orders",
    items: [
      {
        id: 15,
        icon: Sparkles,
        title: "Rewards / Redemption",
        label: "/rewards-redemption",
        requiredPermission: "REWARDS_REDEMPTION",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 16,
        icon: ShoppingBag,
        title: "Order Management",
        label: "/order-management",
        requiredPermission: "ORDER_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
    ],
  },
  {
    id: "settings",
    title: "System & Settings",
    items: [
      {
        id: 19,
        icon: FolderTree,
        title: "Category Management",
        label: "/category-management",
        requiredPermission: "CATEGORY_MANAGEMENT",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 21,
        icon: Activity,
        title: "Server Health",
        label: "/server-health",
        requiredPermission: "SERVER_HEALTH",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 20,
        icon: Settings,
        title: "Settings",
        requiredPermission: "SETTINGS",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
        children: [
          {
            id: 200,
            icon: Sliders,
            title: "General Settings",
            label: "/settings",
            requiredPermission: "SETTINGS",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            id: 201,
            icon: User,
            title: "Profile",
            label: "/profile",
            allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "REFEREE"],
          },
          {
            id: 202,
            icon: FileText,
            title: "Terms & Condition",
            label: "/terms-and-condition",
            requiredPermission: "SETTINGS",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            id: 203,
            icon: ShieldCheck,
            title: "Privacy Policy",
            label: "/privacy-policy",
            requiredPermission: "SETTINGS",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
    ],
  },
];

// Flat list for backward compatibility
export const sidebarData: TMenuItem[] = sidebarSections.flatMap((s) => s.items);
