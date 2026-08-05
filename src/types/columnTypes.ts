export type TUser = {
  id: string
  profilePic: string
  name: string
  email: string
  role: string
  status: string
}

export type TUserManagement = {
  _id: string;
  userName: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  profile: string;
  profilePic?: string;
  verified: boolean;
  status?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  document?: string | string[];
  documents?: string | string[];
  selectTeam?: {
    _id?: string;
    teamName?: string;
    shortName?: string;
    teamLogo?: string;
  };
  nid?: string;
  passport?: string;
  tradeLicense?: string;
  certificate?: string;
  verificationDoc?: string;
  idProof?: string;
  playForAcademy?: boolean;
  academyClubName?: string;
  isDevelopmentPlayer?: boolean;
  mediaConsent?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type MatchStatus = "Completed" | "Scheduled" | "On Going";

export type TMatch = {
  id: number;
  team_a_logo: string;
  team_b_logo: string;
  teams_matchup: string;
  venue: string;
  date: string;
  time: string;
  score: string;
  status: MatchStatus;
}

export type TTable = {
  id: number;
  rating: number;
  logo: string;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
}

export type TTeam = {
  id: number;
  logo: string;
  team: string;
  since: string;
  total_player: number;
  player_imgs: string[];
  status: string;
}

export type TPlayer = {
  _id?: string;
  firstName: string;
  lastName: string;
  profile: string | null;
  position: string | null;
  location?: string | null;
  teamName: string | null;
  shortName: string | null;
  teamLogo: string | null;
  engCoine?: number;
  engCoin?: number;
  coin?: number;
  marketValue?: number;
  goals?: number;
}

export type TTransfer = {
  id: string;
  playerFirstName: string;
  playerLastName: string;
  playerEmail: string;
  playerProfile: string;
  fromTeamName: string;
  toTeamName: string;
  requestedByFirstName: string;
  requestedByLastName: string;
  requestedByEmail: string;
  approvedByFirstName: string | null;
  approvedByLastName: string | null;
  transferType: string;
  status: 'PENDING' | 'MANAGER_APPROVED' | 'APPROVED' | 'REJECTED' | string;
  rejectReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TEngtv = {
  _id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  createdBy: string;
  status: string;
  publishDateTime: string;
  createdAt: string;
  updatedAt: string;
  isHighlight?: boolean;
  order?: number;
}

export type TNews = {
  id: number;
  title: string;
  image: string;
  category: string;
  author: string;
  publishDate: string;
}

export type TNotification = {
  _id: string;
  receiver?: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  updatedAt?: string;
  user?: {
    userName?: string;
    email?: string;
  };
}

export type TReward = {
  id: number;
  rewardName: string;
  image: string;
  type: string;
  pointsRequired: string;
  status: string;
  usage: number;
}

export type TOrder = {
  id: string;
  _id?: string;
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  brandName: string;
  point: number;
  pointUsed: number;
  status: string;
  updatedAt: string;
  createdAt?: string;
}

export type TGallery = {
  _id: string;
  image: string;
  category: string;
  subCategory?: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type TSocialMedia = {
  _id: string;
  platform: string;
  url: string;
  icon?: string;
  status: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export type TSubCategory = {
  _id: string;
  id?: string;
  name: string;
  parentCategory: string;
  status?: string;
  order?: number;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TCategory = {
  _id: string;
  id?: string;
  name: string;
  parentCategory?: string | null;
  status?: string;
  order?: number;
  slug?: string;
  subCategories?: TSubCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export type TPositionReward = {
  position: number;
  positionName: string;
  points: number;
};

export type TTournament = {
  _id: string;
  id?: string;
  title: string;
  description: string;
  banner?: string;
  startDate: string;
  endDate: string;
  positionRewards: TPositionReward[];
  status: "upcoming" | "ongoing" | "completed" | string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TTournamentClaimUser = {
  _id: string;
  userName: string;
  role: string;
  email: string;
  profile?: string | null;
};

export type TTournamentClaim = {
  _id: string;
  id?: string;
  tournament: TTournament;
  user: TTournamentClaimUser;
  claimedPosition: number;
  claimedPositionName: string;
  proofNotes: string;
  status: "pending" | "approved" | "rejected" | string;
  pointsAwarded?: number;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};