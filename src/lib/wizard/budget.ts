/**
 * Plan-budget fitting — never fail a campaign on limits, trim to fit.
 * Mirrors server `LeadService.computeLimits` (bonusCredits = cap,
 * premium/enterprise = unlimited) so wizard trims before upload.
 */

export interface BudgetUser {
  planType?: string | null;
  plan_type?: string | null;
  bonusCredits?: number | null;
  bonus_credits?: number | null;
  leadsExtracted?: number | null;
  leads_extracted?: number | null;
}

/** Remaining lead budget, Infinity for unlimited plans. */
export function remainingLeads(user: BudgetUser | null | undefined): number {
  if (!user) return 0;
  const planType = user.planType ?? user.plan_type ?? 'free';
  if (planType === 'premium' || planType === 'enterprise') return Infinity;
  const total = user.bonusCredits ?? user.bonus_credits ?? 0;
  const used = user.leadsExtracted ?? user.leads_extracted ?? 0;
  return Math.max((total || 0) - (used || 0), 0);
}

/** Even stride sampling — keeps geographic spread when trimming. */
export function strideSample<T>(items: T[], n: number): T[] {
  if (n <= 0) return [];
  if (!Number.isFinite(n)) return items;
  if (items.length <= n) return items;
  const step = items.length / n;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(items[Math.floor(i * step)]);
  return out;
}

/** Hard safety cap per campaign (protects upload + worker). */
export const MAX_KEYWORDS_PER_TASK = 20000;
