export interface ApiErrorPayload {
  message?: string;
  error?: string;
}

export interface ApiErrorLike {
  data?: ApiErrorPayload;
  message?: string;
  error?: string;
}

export interface LeagueRecord {
  _id: string;
  leagueName: string;
  season: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
}

export interface TeamRecord {
  _id: string;
  teamName: string;
  shortName?: string | null;
  teamLogo?: string | null;
  stadiumName?: string | null;
  city?: string | null;
  country?: string | null;
  teamType?: string | null;
  totalMembers?: number;
  createdAt?: string;
}

export interface LeagueTeamEntry {
  league: LeagueRecord;
  teams: TeamRecord[];
  standings?: TableStanding[];
}

export interface MatchReferee {
  _id?: string;
  userName?: string | null;
}

export interface MatchRecord {
  _id: string;
  status: string;
  homeTeam?: TeamRecord | null;
  awayTeam?: TeamRecord | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venueName?: string | null;
  matchDate: string;
  referee?: MatchReferee | null;
  durationMinutes?: number | null;
  notes?: string | null;
}

export interface NewsRecord {
  _id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  status?: string | null;
  publishDateTime?: string | null;
}

export interface RewardRecord {
  _id: string;
  brand: string;
  image?: string | null;
  productType?: string | null;
  point?: number | string | null;
  status?: string | null;
  createdAt?: string | null;
}

export interface TableStanding {
  team?: TeamRecord | null;
  played?: number;
  win?: number;
  draw?: number;
  loss?: number;
  goalDifference?: number;
  points?: number;
}

export interface PrivacyRecord {
  content?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}
