export type TUser = {
  id: string
  profilePic: string
  name: string
  email: string
  role: string
  status: string
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
  id: number;
  image: string;
  name: string;
  logo: string;
  team: string;
  position: string;
  status?: string;
  goals: number;
}

export type TTransfer = {
  id: number;
  image: string;
  name: string;
  f_logo: string;
  f_team: string;
  t_logo: string;
  t_team: string;
}

export type TEngtv = {
  id: number;
  name: string;
  role: string;
  image: string;
  duration: string;
  status: string;
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
  id: number;
  title: string;
  subtitle: string;
  type: string;
  date: string;
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