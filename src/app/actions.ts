'use server';

import { getSession } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { checkRateLimit } from '@/lib/security/ratelimit';
import { AuthService } from '@/services/auth.service';
import { LeadService } from '@/services/lead.service';
import { TaskService } from '@/services/task.service';
import { UserService } from '@/services/user.service';
import { AdminService } from '@/services/admin.service';
import { BlogService } from '@/services/blog.service';
import { PlanService } from '@/services/plan.service';
import { SubscriptionService } from '@/services/subscription.service';
import { ProxyService } from '@/services/proxy.service';
import { SettingsService } from '@/services/settings.service';
import { SiteConfigService } from '@/services/siteconfig.service';
import { AuditService } from '@/services/audit.service';
import { NotificationService } from '@/services/notification.service';
import { KeywordService } from '@/services/keyword.service';
import { ListService } from '@/services/list.service';
import { fromZodError } from 'zod-validation-error';
import { 
  signupSchema, 
  loginSchema, 
  otpSchema, 
  resetPasswordSchema, 
  searchLeadsSchema, 
  createTaskSchema 
} from '@/lib/validations';

// --- Helpers ---

async function getClientInfo() {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = headerList.get('user-agent');
  const acceptLanguage = headerList.get('accept-language');
  return { ip, userAgent, acceptLanguage };
}

function handleActionError(error: any) {
  if (error.name === 'ZodError') {
    return { success: false, error: fromZodError(error).message };
  }
  return { success: false, error: error.message || 'Something went wrong' };
}

export async function logAction(action: string, status: 'success' | 'error' | 'info', metadata: any = {}) {
  return await AuditService.logAction(action, status, metadata);
}

// --- Auth Actions ---

export async function signupAction(name: string, email: string, password: string) {
  try {
    signupSchema.parse({ name, email, password });
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`signup:ip:${ip}`, 5, 60000))) {
      return { success: false, error: 'Too many signup attempts. Try again later.' };
    }
    await AuthService.signup(name, email, password);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function loginAction(email: string, password: string) {
  try {
    loginSchema.parse({ email, password });
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`login:ip:${ip}`, 10, 60000))) {
      return { success: false, error: 'Too many login attempts. Try again later.' };
    }
    await AuthService.login(email, password, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function logoutAction() {
  await AuthService.logout();
  return { success: true };
}

export async function requestOTPAction(email: string) {
  try {
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`otp:ip:${ip}`, 3, 60000))) {
      return { success: false, error: 'Too many OTP requests. Please wait a minute.' };
    }
    await AuthService.requestOTP(email, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function verifyOTPAction(email: string, otp: string) {
  try {
    otpSchema.parse({ email, otp });
    const { ip } = await getClientInfo();
    if (!(await checkRateLimit(`verify_otp:ip:${ip}`, 10, 60000))) {
      return { success: false, error: 'Too many verification attempts. Try again later.' };
    }
    await AuthService.verifyOTP(email, otp, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function resetPasswordAction(email: string, otp: string, newPassword: string) {
  try {
    resetPasswordSchema.parse({ email, otp, newPassword });
    const { ip } = await getClientInfo();
    await AuthService.resetPassword(email, otp, newPassword, ip);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUserAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const user = await UserService.getUser(session.id);
    return { success: true, data: user };
  } catch (e) {
    return { success: false, data: null };
  }
}

export async function getDashboardStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await UserService.getDashboardStats(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Notification Actions ---

export async function getNotificationsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await NotificationService.getByUserId(session.id, 20);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUnreadNotificationCountAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const count = await NotificationService.getUnreadCount(session.id);
    return { success: true, count };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function markNotificationReadAction(notificationId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await NotificationService.markAsRead(session.id, notificationId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function markAllNotificationsReadAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await NotificationService.markAllAsRead(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Lead Actions ---

export async function searchLeadsAction(query: string, taskId?: number, forceStore?: boolean) {
  try {
    searchLeadsSchema.parse({ query, taskId, forceStore });
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { userAgent, acceptLanguage } = await getClientInfo();
    const result = await LeadService.searchLeads(query, taskId, forceStore, { 
      userAgent: userAgent || undefined, 
      acceptLanguage: acceptLanguage || undefined, 
      manualUserId: session.id 
    });
    return result;
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getLeadsAction(searchId?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await LeadService.getLeads(session.id, searchId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function wipeAllLeadsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await LeadService.wipeLeadsForUser(session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Task Actions ---

export async function createTaskAction(name: string, keywords: string[]) {
  try {
    createTaskSchema.parse({ name, keywords });
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { userAgent, acceptLanguage } = await getClientInfo();
    const taskId = await TaskService.createTask(session.id, name, keywords, {
      userAgent: userAgent || null,
      acceptLanguage: acceptLanguage || null
    });
    return { success: true, taskId };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createTaskShellAction(name: string, totalKeywords: number) {
  try {
    const session = await getSession();
    if (!session) return { success: false, error: 'Unauthorized' };
    const { userAgent, acceptLanguage } = await getClientInfo();
    const taskId = await TaskService.createTaskShell(session.id, name, totalKeywords, {
      userAgent: userAgent || null,
      acceptLanguage: acceptLanguage || null
    });
    return { success: true, taskId };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function appendTaskKeywordsAction(taskId: number, keywords: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.appendKeywords(session.id, taskId, keywords);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateTaskStatusAction(taskId: number, status: string, currentIndex?: number, statusReason?: string | null) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.updateStatus(session.id, taskId, status, currentIndex, statusReason);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await TaskService.getTasks(session.id);
    
    // AUTO-RECOVERY LOGIC:
    // Check if any task is 'running' but hasn't had a heartbeat in 3 minutes.
    // If so, it might be stalled due to a server restart or network issue.
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    const stalledTasks = data.filter((t: any) => 
      t.status === 'running' && 
      (!t.lastHeartbeat || new Date(t.lastHeartbeat) < threeMinutesAgo)
    );

    if (stalledTasks.length > 0) {
      console.log(`[ACTIONS] Found ${stalledTasks.length} stalled tasks for user ${session.id}. Recovering...`);
      for (const task of stalledTasks) {
        // Trigger recovery via the standardized runTask method
        void TaskService.runTask(task.id, session.id, 'Auto-recovered — worker stalled');
      }
    }

    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getTaskAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await TaskService.getTask(session.id, taskId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteTaskAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.deleteTask(session.id, taskId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getTaskLeadsAction(taskId: number, limit?: number, offset?: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    // Ownership check should be in service
    const data = await LeadService.getLeads(session.id, taskId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Admin Actions ---

export async function getAdminDashboardStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getDashboardStats();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminChartDataAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getChartData();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminInsightsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getInsights();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAdminTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getAdminTasks();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllUsersAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const users = await AdminService.getAllUsers();
    return { success: true, data: users };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateTaskStatusAdminAction(taskId: number, status: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateTaskStatus(taskId, status);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function bulkUpdateTasksAdminAction(mode: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.bulkUpdateTasks(mode);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateUserPlanAction(targetUserId: number, newPlan: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUser(targetUserId, { planType: newPlan });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function suspendUserAction(userId: number, isSuspended: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUser(userId, { is_suspended: isSuspended });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function toggleUserAdminAction(userId: number, isAdmin: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUser(userId, { is_admin: isAdmin });
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function startAllPendingTasksAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const tasks = await AdminService.startAllPendingTasks(session.id);
    // Kick off processing for the first task if found
    const userTasks = await TaskService.getTasks(session.id);
    const firstRunning = userTasks.find((t: any) => t.status === 'running');
    if (firstRunning) {
      void TaskService.processTaskStep(firstRunning.id, session.id);
    }
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateUserCreditsAction(userId: number, amount: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await AdminService.updateUserCredits(userId, amount);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function recalculateUserUsageAction(userId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const actualCount = await AdminService.recalculateUserUsage(userId);
    return { success: true, actualCount };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getUserHistoryAdminAction(userId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await AdminService.getUserHistory(userId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Blog Actions ---

export async function getAllBlogPostsAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await BlogService.getAllPostsAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createBlogPostAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const id = await BlogService.createPost(data);
    revalidatePath('/blog');
    if (data.slug) revalidatePath(`/blog/${data.slug}`);
    return { success: true, id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateBlogPostAction(id: number, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await BlogService.updatePost(id, data);
    revalidatePath('/blog');
    if (data.slug) revalidatePath(`/blog/${data.slug}`);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteBlogPostAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await BlogService.deletePost(id);
    revalidatePath('/blog');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getBlogPostsPublicAction() {
  try {
    const data = await BlogService.getPostsPublic();
    console.log(`[ACTIONS] getBlogPostsPublicAction: Found ${data.length} published posts`);
    return { success: true, data };
  } catch (error: any) {
    console.error('[ACTIONS] getBlogPostsPublicAction error:', error);
    return handleActionError(error);
  }
}

export async function getBlogPostBySlugPublicAction(slug: string) {
  try {
    const data = await BlogService.getPostBySlugPublic(slug);
    if (!data) return { success: false, error: 'Post not found' };
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Settings & Proxies ---

export async function getSettingsAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await SettingsService.getSettings(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateSettingAction(key: string, value: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await SettingsService.updateSetting(session.id, key, value);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getProxiesAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ProxyService.getProxies(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function addProxyAction(proxy: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await ProxyService.addProxy(session.id, proxy);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteProxyAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await ProxyService.deleteProxy(session.id, id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function toggleProxyAction(id: number, isActive: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await ProxyService.toggleProxy(session.id, id, isActive);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Keywords ---

export async function getCityAreasAction(country: string, state: string, city: string) {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await KeywordService.getCityAreas(country, state, city);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveCityAreasAction(country: string, state: string, city: string, areas: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.saveCityAreas(country, state, city, areas);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getBulkCityAreasAction(country: string, state: string, cities: string[]) {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await KeywordService.getBulkCityAreas(country, state, cities);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveBulkCityAreasAction(country: string, state: string, cityAreas: { city: string, areas: string[] }[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.saveBulkCityAreas(country, state, cityAreas);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function saveKeywordHistoryAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.saveKeywordHistory(session.id, data);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getKeywordHistoryAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await KeywordService.getKeywordHistory(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteKeywordHistoryAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await KeywordService.deleteKeywordHistory(session.id, id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function generateKeywordsAction(niche: string, country: string, state: string, city: string | null, selectAllCities: boolean) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  console.log('[ACTIONS] generateKeywordsAction', { niche, country, state, city, selectAllCities });
  try {
    const { Country, State, City } = await import('country-state-city');
    
    let targetCities: { name: string, stateCode: string, countryCode: string }[] = [];
    const countryObj = Country.getAllCountries().find(c => c.name === country);
    const countryCode = countryObj?.isoCode || 'IN';

    if (selectAllCities && state) {
      const stateObj = State.getStatesOfCountry(countryCode).find(s => s.name === state);
      const cities = City.getCitiesOfState(countryCode, stateObj?.isoCode || '');
      targetCities = cities.map(c => ({ name: c.name, stateCode: stateObj?.isoCode || '', countryCode }));
    } else if (city) {
      const stateObj = State.getStatesOfCountry(countryCode).find(s => s.name === state);
      targetCities = [{ name: city, stateCode: stateObj?.isoCode || '', countryCode }];
    }

    if (targetCities.length === 0) {
      return { success: true, data: [`${niche} in ${city || state || country}, ${state || country}, ${country}`] };
    }

    const allKeywords: string[] = [];

    for (const targetCity of targetCities) {
      const baseString = `${targetCity.name}, ${state}, ${country}`;
      // Add the city-level keyword immediately as the first result
      allKeywords.push(`${niche} in ${baseString}`);

      try {
        console.log(`[ACTIONS] Fetching areas for ${targetCity.name}...`);
        // Fetch areas/post offices for this city from the Indian Post API
        const response = await fetch(`https://api.postalpincode.in/postoffice/${targetCity.name}`, {
          next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0 && data[0].Status === 'Success') {
            const postOffices = data[0].PostOffice;
            const seenAreas = new Set<string>();

            postOffices.forEach((po: any) => {
              const areaName = po.Name;
              if (areaName && !seenAreas.has(areaName)) {
                seenAreas.add(areaName);
                // Format: Dentist in Bedipara, Rajkot, Gujarat, India
                allKeywords.push(`${niche} in ${areaName}, ${baseString}`);
              }
            });
            console.log(`[ACTIONS] Found ${postOffices.length} post offices for ${targetCity.name}`);
          } else {
            console.log(`[ACTIONS] No areas found for ${targetCity.name} via API`);
          }
        } else {
          console.error(`[ACTIONS] Area API returned error: ${response.status}`);
        }
      } catch (err) {
        console.error(`Failed to fetch areas for ${targetCity.name}:`, err);
      }
    }

    console.log(`[ACTIONS] Generated ${allKeywords.length} keywords`);
    return { success: true, data: allKeywords };
  } catch (error: any) {
    console.error('[ACTIONS] generateKeywordsAction error:', error);
    const fallback = city ? [`${niche} in ${city}, ${state}, ${country}`] : [`${niche} in ${state}, ${country}`];
    return { success: true, data: fallback };
  }
}

// --- Saved Lists & Exports ---

export async function getSavedListsAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ListService.getSavedLists(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getSavedListLeadsAction(listId: number) {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ListService.getSavedListLeads(session.id, listId);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getExportTemplatesAction() {
  const session = await getSession();
  if (!session) return { success: false, data: null };
  try {
    const data = await ListService.getExportTemplates(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createExportTemplateAction(name: string, columns: string[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const id = await ListService.createExportTemplate(session.id, name, columns);
    return { success: true, templateId: id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createSavedListAction(name: string, leadIds: number[], description?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const id = await ListService.createSavedList(session.id, name, leadIds, description);
    return { success: true, listId: id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createSavedListFromLeadsAction(name: string, leads: any[], description?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const id = await ListService.createSavedList(session.id, name, [], description);
    return { success: true, listId: id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Telemetry & Tasks ---

export async function saveServerLogAction(taskId: number | null, level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN', message: string) {
  const session = await getSession();
  return await AuditService.saveServerLog(taskId, level, message, session?.id || null);
}

export async function sendLogsToTelegramAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.sendLogsToTelegram(taskId, session.id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function triggerTaskAutomationAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  console.log(`[ACTIONS] triggerTaskAutomationAction for task ${taskId}`);
  try {
    const task = await TaskService.getTask(session.id, taskId);
    if (!task) return { success: false, error: 'Task not found' };

    // Concurrent limit check based on user's plan
    const user = await UserService.getUser(session.id);
    const planType = user?.planType || 'free';
    const plan = await PlanService.getPlanByName(planType);
    const maxConcurrent = plan?.maxConcurrentTasks || 1;

    const activeCount = await TaskService.countActiveTasks(session.id);
    // Don't count the current task if it's already pending (we're re-triggering it)
    const otherActive = task.status === 'pending' || task.status === 'running' ? activeCount - 1 : activeCount;
    if (otherActive >= maxConcurrent) {
      return { 
        success: false, 
        error: `Your current plan (${planType}) allows only ${maxConcurrent} concurrent task${maxConcurrent === 1 ? '' : 's'}. Please wait for a running task to finish or upgrade.`,
        limitType: 'concurrent'
      };
    }

    // The worker picks up tasks that are marked as 'pending'
    await TaskService.updateStatus(session.id, taskId, 'pending', undefined, 'Queued — waiting for worker');

    return { success: true };
  } catch (error: any) {
    console.error('[ACTIONS] triggerTaskAutomationAction error:', error);
    return handleActionError(error);
  }
}

export async function updateTaskLeadCountAction(taskId: number, count: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await TaskService.updateStatus(session.id, taskId, 'running');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function uploadTaskExportChunkAction(taskId: number, name: string, csv: string, index: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function sendTaskExportToTelegramAction(taskId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function processTaskStepAction(taskId: number, userId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  if (!session.is_admin && session.id !== userId) {
    return { success: false, error: 'Forbidden' };
  }
  return await TaskService.processTaskStep(taskId, userId);
}

// --- Plan & Subscription Actions ---

export async function getPlansAction() {
  try {
    const data = await PlanService.getAllPlans();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllPlansAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await PlanService.getAllPlansAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createPlanAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const id = await PlanService.createPlan(data);
    return { success: true, id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updatePlanAction(id: number, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await PlanService.updatePlan(id, data);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deletePlanAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await PlanService.deletePlan(id);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createCheckoutSessionAction(planId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const result = await SubscriptionService.createOrder(session.id, planId);
    return { success: true, data: result };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function checkOrderStatusAction(orderId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const status = await SubscriptionService.getOrderStatus(orderId);
    return { success: true, status };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getPaymentHistoryAction(cursor?: number, limit = 10) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await SubscriptionService.getPaymentHistory(session.id, cursor, limit);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getPaymentStatsAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    const data = await SubscriptionService.getPaymentStats(session.id);
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getAllPaymentsAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await SubscriptionService.getAllPaymentsAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function acceptPaymentAdminAction(transactionId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await SubscriptionService.acceptPayment(transactionId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function rejectPaymentAdminAction(transactionId: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await SubscriptionService.rejectPayment(transactionId);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

// --- Banner / Site Config Actions ---

export async function getBannerAction() {
  try {
    const data = await SiteConfigService.getBanner();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateBannerAdminAction(data: {
  enabled: boolean;
  text: string;
  buttonText: string;
  buttonUrl: string;
  bgColor: string;
  countdownEnd?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await SiteConfigService.setBanner(data);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}


