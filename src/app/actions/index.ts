// Barrel re-export — all consuming files import from '@/app/actions' which resolves here.
export { logAction } from './helpers';

// Auth
export {
  signupAction,
  loginAction,
  logoutAction,
  requestOTPAction,
  verifyOTPAction,
  resetPasswordAction,
  getUserAction,
  getDashboardStatsAction,
} from './auth.actions';

// Notifications & Push
export {
  getNotificationsAction,
  getUnreadNotificationCountAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  subscribePushAction,
  unsubscribePushAction,
} from './notification.actions';

// Leads
export {
  searchLeadsAction,
  getLeadsAction,
  wipeAllLeadsAction,
} from './lead.actions';

// Tasks
export {
  createTaskAction,
  createTaskShellAction,
  appendTaskKeywordsAction,
  updateTaskStatusAction,
  getTasksAction,
  getTaskAction,
  deleteTaskAction,
  getTaskLeadsAction,
  saveServerLogAction,
  sendLogsToTelegramAction,
  triggerTaskAutomationAction,
  updateTaskLeadCountAction,
  uploadTaskExportChunkAction,
  processTaskStepAction,
} from './task.actions';

// Admin
export {
  getAdminDashboardStatsAction,
  getAdminChartDataAction,
  getAdminInsightsAction,
  getAdminTasksAction,
  getAdminTasksDetailedAction,
  getAllUsersAdminAction,
  updateTaskStatusAdminAction,
  bulkUpdateTasksAdminAction,
  updateUserPlanAction,
  suspendUserAction,
  toggleUserAdminAction,
  startAllPendingTasksAction,
  updateUserCreditsAction,
  recalculateUserUsageAction,
  getUserHistoryAdminAction,
} from './admin.actions';

// Blog
export {
  getAllBlogPostsAdminAction,
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
  getBlogPostsPublicAction,
  getBlogPostBySlugPublicAction,
} from './blog.actions';

// Settings & Proxies
export {
  getSettingsAction,
  updateSettingAction,
  getProxiesAction,
  addProxyAction,
  deleteProxyAction,
  toggleProxyAction,
} from './settings.actions';

// Keywords
export {
  getCityAreasAction,
  saveCityAreasAction,
  getBulkCityAreasAction,
  saveBulkCityAreasAction,
  saveKeywordHistoryAction,
  getKeywordHistoryAction,
  deleteKeywordHistoryAction,
  generateKeywordsAction,
} from './keyword.actions';

// Saved Lists & Export Templates
export {
  getSavedListsAction,
  getSavedListLeadsAction,
  getExportTemplatesAction,
  createExportTemplateAction,
  createSavedListAction,
  createSavedListFromLeadsAction,
} from './list.actions';

// Plans, Subscriptions & Payments
export {
  getPlansAction,
  getAllPlansAdminAction,
  createPlanAction,
  updatePlanAction,
  deletePlanAction,
  permanentDeletePlanAction,
  createCheckoutSessionAction,
  checkOrderStatusAction,
  getPaymentHistoryAction,
  getPaymentStatsAction,
  getAllPaymentsAdminAction,
  acceptPaymentAdminAction,
  rejectPaymentAdminAction,
} from './plan.actions';

// Site Config (Banner)
export {
  getBannerAction,
  updateBannerAdminAction,
} from './siteconfig.actions';
