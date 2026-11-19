export interface IAppRouteItem {
  screen: string;
  constant: string;
  route: string;
  category: string;
  description?: string;
}

export interface IAppRouteCategory {
  category: string;
  routes: IAppRouteItem[];
}

export const APP_ROUTES_CATEGORIES: IAppRouteCategory[] = [
  {
    category: "১. Auth & Onboarding",
    routes: [
      {
        screen: "SplashScreen",
        constant: "AppRoutes.splash",
        route: "/",
        category: "Auth & Onboarding",
      },
      {
        screen: "OnboardingScreen",
        constant: "AppRoutes.onboarding",
        route: "/onboarding_screen.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "SelectRole",
        constant: "AppRoutes.roleSelectScreen",
        route: "/role_select_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "SignInScreen",
        constant: "AppRoutes.signIn",
        route: "/sign_in_screen.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "SignUpScreen",
        constant: "AppRoutes.signUp",
        route: "/sign_up_screen.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "VerifyUser",
        constant: "AppRoutes.verifyUser",
        route: "/verify_user.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "PlayerRegisterScreen",
        constant: "AppRoutes.playerRegistrationScreen",
        route: "/player_registration_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "TournamentPlayerRegisterScreen",
        constant: "AppRoutes.tournamentPlayerRegistration",
        route: "/tournament_player_registration",
        category: "Auth & Onboarding",
      },
      {
        screen: "VerifyPlayerScreen",
        constant: "AppRoutes.verifyPlayerScreen",
        route: "/verify_player_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "ManagerRegistationScreen",
        constant: "AppRoutes.managerRegistrationScreen",
        route: "/manager_registation_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "ManagerSubscriptionScreen",
        constant: "AppRoutes.managerSubscriptionScreen",
        route: "/manager_subscription_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "TrialRegistrationScreen",
        constant: "AppRoutes.trialRegistrationScreen",
        route: "/trial_registration_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "RefereeInfoScreen",
        constant: "AppRoutes.refereeInfoScreen",
        route: "/referee_info_screen",
        category: "Auth & Onboarding",
      },
      {
        screen: "SuccessfulCreateAccount",
        constant: "AppRoutes.successfulCreateAccount",
        route: "/successful_create_account",
        category: "Auth & Onboarding",
      },
      {
        screen: "ForgotPasswordScreen",
        constant: "AppRoutes.forgotPassword",
        route: "/forgot_password.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "VerifyScreen",
        constant: "AppRoutes.verifyEmail",
        route: "/verify_screen.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "CreatePassword",
        constant: "AppRoutes.createPassword",
        route: "/create_password.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "ChangePasswordScreen",
        constant: "AppRoutes.changePassword",
        route: "/change_password_screen.dart",
        category: "Auth & Onboarding",
      },
      {
        screen: "DeleteAccountScreen",
        constant: "AppRoutes.deleteAccount",
        route: "/delete_account",
        category: "Auth & Onboarding",
      },
    ],
  },
  {
    category: "২. Home, Navigation & Media",
    routes: [
      {
        screen: "NavBarScreen (Home / Bottom Nav)",
        constant: "AppRoutes.navBarScreen",
        route: "/navBarScreen.dart",
        category: "Home & Media",
      },
      {
        screen: "MaintenanceScreen",
        constant: "AppRoutes.maintenanceScreen",
        route: "/maintenance_screen",
        category: "Home & Media",
      },
      {
        screen: "NotificationsScreen",
        constant: "AppRoutes.notifications",
        route: "/notifications_screen.dart",
        category: "Home & Media",
      },
      {
        screen: "AllNewsScreen",
        constant: "AppRoutes.allNews",
        route: "/allNews",
        category: "Home & Media",
      },
      {
        screen: "NewsDetailsScreen",
        constant: "AppRoutes.newsDetails",
        route: "/newsDetails",
        category: "Home & Media",
      },
      {
        screen: "AllEventsScreen",
        constant: "AppRoutes.allEvents",
        route: "/allEvents",
        category: "Home & Media",
      },
      {
        screen: "AllResultsScreen",
        constant: "AppRoutes.allResults",
        route: "/allResults",
        category: "Home & Media",
      },
      {
        screen: "AllVideosScreen",
        constant: "AppRoutes.allVideos",
        route: "/allVideos",
        category: "Home & Media",
      },
      {
        screen: "VideoStreamScreen",
        constant: "AppRoutes.videoStreamScreen",
        route: "/videoStreamScreen.dart",
        category: "Home & Media",
      },
      {
        screen: "AllGalleryScreen",
        constant: "AppRoutes.allGallery",
        route: "/allGallery",
        category: "Home & Media",
      },
      {
        screen: "OurPartnersScreen (Sponsors)",
        constant: "AppRoutes.ourPartners",
        route: "/ourPartners",
        category: "Home & Media",
      },
    ],
  },
  {
    category: "৩. Voting, Quiz, Score Prediction & Promotional Zone",
    routes: [
      {
        screen: "AllVotingScreen (Player & Referee Voting)",
        constant: "AppRoutes.allVoting",
        route: "/all_voting_screen",
        category: "Interactive & Games",
      },
      {
        screen: "QuizListScreen",
        constant: "AppRoutes.quizList",
        route: "/quiz_list_screen",
        category: "Interactive & Games",
      },
      {
        screen: "QuizGameplayScreen",
        constant: "AppRoutes.quizGameplay",
        route: "/quiz_gameplay_screen",
        category: "Interactive & Games",
      },
      {
        screen: "QuizResultScreen",
        constant: "AppRoutes.quizResult",
        route: "/quiz_result_screen",
        category: "Interactive & Games",
      },
      {
        screen: "ScorePredictionListScreen (All Prediction Polls)",
        constant: "AppRoutes.scorePredictionList",
        route: "/score_prediction_list_screen",
        category: "Interactive & Games",
      },
      {
        screen: "ScorePredictionScreen (Single Poll Details / Play)",
        constant: "AppRoutes.scorePrediction",
        route: "/score_prediction_screen",
        category: "Interactive & Games",
      },
      {
        screen: "PromotionalZoneScreen",
        constant: "AppRoutes.promotionalZone",
        route: "/promotional_zone_screen",
        category: "Interactive & Games",
      },
      {
        screen: "PromotionalDetailScreen",
        constant: "AppRoutes.promotionalDetail",
        route: "/promotional_detail_screen",
        category: "Interactive & Games",
      },
    ],
  },
  {
    category: "৪. Matches, Leagues, Tournaments & Stats",
    routes: [
      {
        screen: "FixturesScreen",
        constant: "AppRoutes.fixtures",
        route: "/fixtures_screen.dart",
        category: "Matches & Competitions",
      },
      {
        screen: "MatchInfoScreen",
        constant: "AppRoutes.matchInfo",
        route: "/matchInfo",
        category: "Matches & Competitions",
      },
      {
        screen: "LeaguePreviewScreen",
        constant: "AppRoutes.leaguePreview",
        route: "/leaguePreview",
        category: "Matches & Competitions",
      },
      {
        screen: "LeagueTablesScreen",
        constant: "AppRoutes.leagueTable",
        route: "/leagueTable",
        category: "Matches & Competitions",
      },
      {
        screen: "TournamentsScreen",
        constant: "AppRoutes.tournaments",
        route: "/tournaments",
        category: "Matches & Competitions",
      },
      {
        screen: "ClubProfileScreen",
        constant: "AppRoutes.clubProfileScreen",
        route: "/clubProfileScreen.dart",
        category: "Matches & Competitions",
      },
      {
        screen: "StatsScreen",
        constant: "AppRoutes.statsScreen",
        route: "/statsScreen",
        category: "Matches & Competitions",
      },
      {
        screen: "SeasonStatsScreen",
        constant: "AppRoutes.seasonStatsScreen",
        route: "/seasonStatsScreen.dart",
        category: "Matches & Competitions",
      },
      {
        screen: "TopPerformersScreen",
        constant: "AppRoutes.topPerformersScreen",
        route: "/top_performers_screen",
        category: "Matches & Competitions",
      },
      {
        screen: "PlayerComparisonScreen",
        constant: "AppRoutes.playerComparisonScreen",
        route: "/playerComparisonScreen.dart",
        category: "Matches & Competitions",
      },
      {
        screen: "AddPlayerScreen",
        constant: "AppRoutes.addPlayerScreen",
        route: "/addPlayerScreen.dart",
        category: "Matches & Competitions",
      },
    ],
  },
  {
    category: "৫. Profile, Players, Transfers, Referee & Shop",
    routes: [
      {
        screen: "ProfileScreen",
        constant: "AppRoutes.profile",
        route: "/profile_screen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "MyProfileScreen",
        constant: "AppRoutes.myProfile",
        route: "/myProfile",
        category: "Profile & Settings",
      },
      {
        screen: "EditProfile",
        constant: "AppRoutes.editProfile",
        route: "/edit_profile.dart",
        category: "Profile & Settings",
      },
      {
        screen: "MyChildrenScreen",
        constant: "AppRoutes.myChildren",
        route: "/myChildren",
        category: "Profile & Settings",
      },
      {
        screen: "PlayerProfileScreen",
        constant: "AppRoutes.playerProfile",
        route: "/playerProfile",
        category: "Profile & Settings",
      },
      {
        screen: "PlayerProfileDetailsScreen",
        constant: "AppRoutes.playerProfileDetailsScreen",
        route: "/playerProfileDetailsScreen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "CoinHistoryScreen",
        constant: "AppRoutes.coinHistory",
        route: "/coin_history",
        category: "Profile & Settings",
      },
      {
        screen: "MySubscribedTeamsScreen",
        constant: "AppRoutes.mySubscribedTeams",
        route: "/mySubscribedTeams",
        category: "Profile & Settings",
      },
      {
        screen: "MySubscriptionScreen",
        constant: "AppRoutes.mySubscription",
        route: "/subscription_screen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "ShopScreen",
        constant: "AppRoutes.shopScreen",
        route: "/shop_screen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "ManagerTeamsScreen",
        constant: "AppRoutes.managerTeams",
        route: "/manager_teams",
        category: "Profile & Settings",
      },
      {
        screen: "TeamSheetScreen",
        constant: "AppRoutes.teamSheetScreen",
        route: "/team_sheet_screen",
        category: "Profile & Settings",
      },
      {
        screen: "TransferScreen (Trial List)",
        constant: "AppRoutes.trialList",
        route: "/trial-list",
        category: "Profile & Settings",
      },
      {
        screen: "TransferRequestScreen",
        constant: "AppRoutes.transferRequestScreen",
        route: "/transfer_request_screen",
        category: "Profile & Settings",
      },
      {
        screen: "TransferPendingApproval",
        constant: "AppRoutes.transferPendingApproval",
        route: "/transferPendingApproval.dart",
        category: "Profile & Settings",
      },
      {
        screen: "TransfersHistoryScreen",
        constant: "AppRoutes.transferHistoryScreen",
        route: "/transfer_history_screen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "RefereeDashboardScreen",
        constant: "AppRoutes.refereeDashboardScreen",
        route: "/referee_dashboard_screen",
        category: "Profile & Settings",
      },
      {
        screen: "LiveMatchControlScreen",
        constant: "AppRoutes.liveMatchControlScreen",
        route: "/live_match_control_screen",
        category: "Profile & Settings",
      },
      {
        screen: "RecordGoalScreen",
        constant: "AppRoutes.recordGoalScreen",
        route: "/record_goal_screen",
        category: "Profile & Settings",
      },
      {
        screen: "SettingScreen",
        constant: "AppRoutes.setting",
        route: "/setting_screen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "PrivacyPolicyScreen",
        constant: "AppRoutes.privacyPolicy",
        route: "/privacy_policy_screen.dart",
        category: "Profile & Settings",
      },
      {
        screen: "TermsOfServicesScreen",
        constant: "AppRoutes.termsOfServices",
        route: "/terms_of_services_screen.dart",
        category: "Profile & Settings",
      },
    ],
  },
];

export const ALL_APP_ROUTES: IAppRouteItem[] = APP_ROUTES_CATEGORIES.flatMap((c) => c.routes);
