'use client';

import KeywordGenerator from "@/components/KeywordGenerator";
import { useAutomation } from "@/context/AutomationContext";
import { AppSidebar } from "@/components/AppSidebar";
import { AppPage } from "@/components/AppPage";

export default function KeywordsPage() {
  const { startNewTask, handleSearch } = useAutomation();

  return (
    <>
      <AppSidebar />
      <AppPage
        title="Keyword Generator"
        description="Create localized keyword lists for fast, repeatable lead extraction."
        breadcrumb={[{ label: "Dashboard", href: "/" }, { label: "Keyword Generator" }]}
      >
        <KeywordGenerator 
          onSearch={(kw) => handleSearch(undefined, kw)} 
          onStartTask={startNewTask}
        />
      </AppPage>
    </>
  );
}
