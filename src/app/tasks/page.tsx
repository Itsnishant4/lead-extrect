'use client';

import TasksList from "@/components/TasksList";
import { useAutomation } from "@/context/AutomationContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/AppSidebar";
import { AppPage } from "@/components/AppPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function TasksPage() {
  const { tasks, handlePauseTask, handleResumeTask, handleDeleteTask, user, isLoadingTasks } = useAutomation();
  const limits: Record<string, number> = {
    free: 500,
    pro: 5000,
    premium: Infinity
  };
  const baseLimit = limits[user?.plan_type || "free"] ?? 500;
  const bonus = user?.bonus_credits || 0;
  const currentLimit = baseLimit === Infinity ? Infinity : baseLimit + bonus;
  const used = user?.leads_extracted || 0;
  const creditsExhausted = currentLimit !== Infinity && used >= currentLimit;

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Automation Tasks"
        description="Monitor active campaigns, pause extractions, and export results."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Automation Tasks" }]}
      >
        {creditsExhausted && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-destructive">Credits exhausted</CardTitle>
              <CardDescription className="text-destructive/80">
                Your credits are exhausted. Upgrade your plan to continue running campaigns.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
        {isLoadingTasks ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : (
          <TasksList 
            tasks={tasks} 
            onPause={handlePauseTask} 
            onResume={handleResumeTask} 
            onDelete={handleDeleteTask}
          />
        )}
      </AppPage>
    </>
  );
}
