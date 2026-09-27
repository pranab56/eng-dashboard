/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  LayoutDashboard,
  Gamepad2,
  Trophy,
  Award,
  Gift,
  Table2,
  Shield,
  Users,
  UserCheck,
  Users2,
  ArrowLeftRight,
  UserCog,
  ShieldAlert,
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
  Settings,
  Sliders,
  User,
  FileText,
  ShieldCheck,
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
  const normalized = userRole.toUpperCase();

  // Super admin always has unrestricted system-wide access
  if (normalized === "SUPER_ADMIN") return true;

  // Check role restrictions
  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === normalized);
    if (!isAllowed) return false;
  }

  // Check granular permission if configured
  if (requiredPermission) {
    if (!userPermissions || !userPermissions.includes(requiredPermission)) {
      return false;
    }
  }

  return true;
}

/**
 * Filters navigation sections and their children based on the user's role and permissions.
 * If a parent section or submenu has no accessible items, it is cleanly omitted.
 */
export function getAuthorizedNavigation(
  sections: TSidebarSection[],
  userRole?: string | null,
  userPermissions?: string[] | null
): TSidebarSection[] {
  // If role is missing during initial load, fallback gracefully to ADMIN/SUPER_ADMIN view
  const activeRole = userRole || "ADMIN";

  return sections
    .map((section) => {
      // Check section-level roles
      if (section.allowedRoles && !hasRoleOrPermission(activeRole, userPermissions, section.allowedRoles)) {
        return null;
      }

      const authorizedItems = section.items
        .map((item) => {
          // If item contains children (nested submenu)
          if (item.children && item.children.length > 0) {
            const accessibleChildren = item.children.filter((child) =>
              hasRoleOrPermission(activeRole, userPermissions, child.allowedRoles, child.requiredPermission)
            );

            // Hide parent dropdown if no child route is permitted
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
        icon: Gamepad2,
        title: "Match Management",
        label: "/match-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "REFEREE", "MANAGER"],
      },
      {
        id: 3,
        icon: Trophy,
        title: "League Management",
        label: "/league-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 31,
        icon: Award,
        title: "Tournaments",
        label: "/tournaments",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 32,
        icon: Gift,
        title: "Tournament Claim",
        label: "/tournament-claim",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 6,
        icon: Table2,
        title: "Table Management",
        label: "/table-management",
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
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 5,
        icon: Users,
        title: "League Team",
        label: "/league-team",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 7,
        icon: UserCheck,
        title: "Player Management",
        label: "/player-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 71,
        icon: Users2,
        title: "Parent Management",
        label: "/parent-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 8,
        icon: ArrowLeftRight,
        title: "Transfer Management",
        label: "/transfer-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
    ],
  },
  {
    id: "users",
    title: "Users & Plans",
    items: [
      {
        id: 11,
        icon: UserCog,
        title: "User Management",
        label: "/user-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 111,
        icon: ShieldAlert,
        title: "Incomplete Accounts",
        label: "/incomplete-accounts",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 14,
        icon: CreditCard,
        title: "Subscribe Plan",
        label: "/subscribe-plan",
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
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 9,
        icon: Tv,
        title: "ENG TV Management",
        label: "/engtv-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 10,
        icon: Newspaper,
        title: "News Management",
        label: "/news-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 12,
        icon: Calendar,
        title: "Event Management",
        label: "/event-management",
        allowedRoles: ["SUPER_ADMIN", "ADMIN", "MANAGER"],
      },
      {
        id: 17,
        icon: ImageIcon,
        title: "Gallery",
        label: "/gallery",
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 18,
        icon: Share2,
        title: "Social Media",
        label: "/social-media",
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
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 16,
        icon: ShoppingBag,
        title: "Order Management",
        label: "/order-management",
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
        allowedRoles: ["SUPER_ADMIN", "ADMIN"],
      },
      {
        id: 20,
        icon: Settings,
        title: "Settings",
        children: [
          {
            id: 200,
            icon: Sliders,
            title: "General Settings",
            label: "/settings",
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
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
          {
            id: 203,
            icon: ShieldCheck,
            title: "Privacy Policy",
            label: "/privacy-policy",
            allowedRoles: ["SUPER_ADMIN", "ADMIN"],
          },
        ],
      },
    ],
  },
];

// Flat list for backward compatibility
export const sidebarData: TMenuItem[] = sidebarSections.flatMap((s) => s.items);
