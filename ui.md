# Project UI & Functionality Documentation

This document provides a comprehensive, inch-by-inch analysis of the user interface and functionality for every page in the LeadSpotter application.

---

## 1. Global UI Elements

### AppSidebar (`src/components/AppSidebar.tsx`)
**UI Description:**
The `AppSidebar` is the persistent navigation drawer located on the left side of the application (except for the landing page). It features a collapsible design that adapts to the screen size.
-   **Header:** Displays the "LeadSpotter" logo and brand name.
-   **Navigation Menu:** A vertical list of links to the main application modules:
    -   Lead Extractor (Magnifying Glass icon)
    -   Keyword Generator (List icon)
    -   Automation Tasks (Activity icon)
    -   History (ClockCounterClockwise icon)
    -   Saved Lists (Stack icon)
    -   Settings (GearSix icon)
    -   Subscription (CreditCard icon)
-   **Usage Stats:** A dynamic section visible to logged-in users. It shows the number of leads extracted versus the user's plan limit (e.g., "125 / 500"). A progress bar visually represents this usage. It also displays the current plan type (e.g., "Plan: Free").
-   **Quick Actions:** A footer section (hidden when collapsed) offering shortcuts to frequent tasks:
    -   "New extraction" button (navigates to `/leads`)
    -   "Generate keywords" button (navigates to `/keywords`)
-   **User Menu:** A dropdown at the bottom showing the user's avatar, name, and email. Clicking it reveals options for "Profile" and "Log out".

**Functionality:**
-   **Navigation:** Uses `Link` from `next/link` for client-side routing. highlight the active page based on `usePathname`.
-   **Collapsibility:** Uses `Sidebar` component state to toggle between expanded and icon-only modes.
-   **User Context:** Consumes `useAutomation` hook to fetch and display real-time user stats (credits, plan) and user details.
-   **Logout:** Triggers `logoutAction` server action to clear the session and redirects to `/login`.

---

## 2. Landing / Home Page (`src/app/page.tsx`)

**Page:** `Home`
**Path:** `/`

### UI Description
**Hero Section:**
-   **Headline:** "Turn Google Maps into your verified leads database." Uses large, bold typography with a gradient effect on "verified leads".
-   **Subheadline:** Explains the value proposition: automated extraction, email finding, and export capabilities.
-   **CTA Button:** A primary "Get Started for Free" button with an arrow icon, linking to `/leads`.
-   **Hero Image:** A high-quality, optimized screenshot of the dashboard (`/hero-dark.png`), displayed with a shadow and border to simulate a floating interface.
-   **Social Proof:** A "Trusted by" section displaying logos of known companies (though likely placeholders in this context) to build credibility.

**Features Section:**
-   **Grid Layout:** A 3-column grid showcasing core features.
-   **Cards:** Each feature (e.g., "Unlimited Extraction", "verified Emails") is presented in a card with a dedicated icon, title, and description.
-   **Animations:** Elements animate into view using `framer-motion` (fade-in, slide-up).

**How It Works Section:**
-   **Step-by-Step Guide:** A numbered list or visual flow explaining the process: (1) Select Niche, (2) Choose Location, (3) Extract Leads.

**Pricing Preview:**
-   **Cards:** Displays abbreviated pricing tiers (Free, Pro, Business) with monthly costs and key feature checkmarks.

### Functionality
-   **Marketing Focus:** This page is purely informational and conversion-focused. It does not contain complex application logic.
-   **Responsiveness:** Fully responsive design using Tailwind CSS grid and flexbox utilities.
-   **Optimization:** Uses `next/image` for the hero image and `next/font` for typography to ensure low Cumulative Layout Shift (CLS) and fast Largest Contentful Paint (LCP).

### Functions Inventory
-   `HomePage()`: Main React component.
-   (Internal) `HeroSection`, `FeaturesSection`: Sub-components for layout organization.

---

## 3. Lead Extractor Page (`src/app/leads/page.tsx`)

**Page:** `LeadsPage`
**Path:** `/leads`

### UI Description
**Header:**
-   **Title:** "Lead Extractor".
-   **Breadcrumbs:** Dashboard > Leads.
-   **Description:** "Find and extract business leads from Google Maps."

**Search Interface:**
-   **Input Fields:**
    -   **Keyword:** A text input for the business type (e.g., "Dentists").
    -   **Location:** A text input for the target city/area (e.g., "New York").
-   **Search Button:** A primary button to trigger the search. Changes state to a loading spinner during fetching.

**Results Table:**
-   **Columns:** Name, Address, Phone, Website, Rating, Reviews, Email (if found), Social Profiles.
-   **Actions:** Each row has a "Save" button to add the lead to a list.
-   **Pagination:** Standard "Previous" and "Next" buttons at the bottom.

**Sidebar/Filters (if applicable):**
-   **Filters:** Options to filter by "Has Email", "Has Phone", "Rating 4.0+".

### Functionality
-   **Data Fetching:** Uses `@tanstack/react-query` to fetch search results from the backend API.
-   **Real-time Search:** The search input might debounce or trigger a query on button click.
-   **Lead Extraction:** This is the core engine. When a user searches, the frontend displays cached or fresh results.
-   **Export:** Allows users to download the current view as CSV.

### Functions Inventory
-   `handleSearch(keyword, location)`: Triggers the API call to search for leads.
-   `saveLead(leadId)`: Adds a specific lead to the user's saved list.
-   `exportLeads()`: Generates a CSV of the visible leads.

---

## 4. Keyword Generator Page (`src/app/keywords/page.tsx`)

**Page:** `KeywordsPage`
**Path:** `/keywords`

### UI Description
**Layout:**
-   **Two-Column Grid:** A "Control Panel" on the left and a "Live Preview" on the right.

**Control Panel (Left):**
-   **Niche Selection:** A combobox to select from presets (Dentist, Plumber) or a "Custom input" checkbox to type a freeform niche.
-   **Location Selectors:**
    -   **Country:** Combobox (via `country-state-city` library).
    -   **State:** Combobox, dependent on Country.
    -   **City:** Combobox, dependent on State.
    -   **"Target all cities" Checkbox:** Disables the city selector and targets the entire state.
-   **Deep Search Toggle:** A switch to enable "Search every Pincode".
-   **Generate Button:** A prominent button to start the generation process.

**Live Preview Panel (Right):**
-   **Header:** Shows the count of generated keywords (e.g., "120 keywords ready") and a copy-to-clipboard button.
-   **Scrollable List:** Displays the generated keywords (e.g., "Dentist in Albany", "Dentist in Brooklyn").
-   **Truncation Warning:** If the list is huge, shows "X more keywords hidden".
-   **Launch Automation Card:**
    -   **Campaign Name Input:** Allows naming the task (auto-filled based on niche/location).
    -   **"Launch automation" Button:** Starts the background extraction task using the generated keywords.

### Functionality
-   **Keyword Logic:**
    -   **Standard:** Combines `[Niche] + [City]`.
    -   **All Cities:** Iterates through all cities in the selected state to create `[Niche] + [City]` combinations.
    -   **Deep Search:** Fetches pincodes for the selected city and generates `[Niche] + [City] + [Pincode]`.
-   **State Management:** Complex local state manages dependencies between Country -> State -> City.
-   **Server Actions:**
    -   `generateKeywordsAction`: Handles the logic of combining locations and niches.
    -   `fetch('/api/pincodes')`: Used for Deep Search to get granular location data.
    -   `saveKeywordHistoryAction`: Saves the generated batch for later use.

### Functions Inventory
-   `generateKeywords()`: Orchestrates the generation process, calls server actions, and updates local state.
-   `copyAll()`: Copies the keyword list to the clipboard.
-   `onStartTask()`: Passed from context, initiates the background job.

---

## 5. Automation Tasks Page (`src/app/tasks/page.tsx`)

**Page:** `TasksPage`
**Path:** `/tasks`

### UI Description
**Task List Card:**
-   **Header:** "Automation Tasks" with badges for status counts (Running, Paused, Completed).
-   **Empty State:** A dashed border area prompting the user to create a campaign if none exist.
-   **Task Rows:**
    -   **Info:** Task Name, Creation Date.
    -   **Status Badge:** Color-coded (Green for Running, Yellow for Paused, Blue for Completed).
    -   **Progress Bar:** Visual indicator of `current_keyword_index / total_keywords`.
    -   **Leads Count:** Number of leads found so far.
    -   **Actions:**
        -   **Pause/Resume:** Toggle button.
        -   **Export:** Dropdown to download CSV.
        -   **Delete:** Trash icon with confirmation.

### Functionality
-   **Auto-Resume:** Uses `useEffect` to call `startAllPendingTasks()` on mount, ensuring interrupted tasks restart.
-   **Polling:** Likely uses `useQuery` with a `refetchInterval` to update progress bars and lead counts in near real-time.
-   **Task Management:**
    -   **Pause/Resume:** API calls to update task status in the DB.
    -   **Deletion:** Removes the task and its associated leads.
    -   **Export:** Generates a CSV for the specific task's leads.

### Functions Inventory
-   `startAllPendingTasks()`: Resumes tasks on page load.
-   `onPause(taskId)`: Pauses a running task.
-   `onResume(taskId)`: Resumes a paused task.
-   `onDelete(taskId)`: Deletes a task.
-   `downloadTaskCSV(taskId)`: Triggers the download.

---

## 6. History Page (`src/app/history/page.tsx`)

**Page:** `HistoryPage`
**Path:** `/history`

### UI Description
-   **Table Layout:** Displays past keyword generation sessions.
-   **Columns:** 
    -   **Automation Name:** The name given to the batch.
    -   **Niche:** The business category.
    -   **Location:** City/State target.
    -   **Keywords:** Count of keywords in the batch.
    -   **Created:** Date.
    -   **Actions:** "Load" button (restores the session to the Keyword Generator) and "Delete" button.

### Functionality
-   **Persistence:** Allows users to reuse previous successful keyword configurations without rebuilding them manually.
-   **Integration:** The "Load" action redirects the user to `/keywords` with the state pre-populated from the history item.

### Functions Inventory
-   `loadKeywordSession(item)`: Updates the automation context with the historical data and navigates to the keywords page.
-   `deleteHistory(id)`: Removes the history entry.

---

## 7. Saved Lists Page (`src/app/lists/page.tsx`)

**Page:** `SavedListsPage`
**Path:** `/lists`

### UI Description
**Two-Pane Layout:**
-   **Left Pane (List Selection):** A vertical list of user-created lists. Each item shows the list name and lead count.
-   **Right Pane (Export & Actions):**
    -   **Template Selector:** Dropdown to choose export formats (e.g., "Email Only", "Full Data").
    -   **Create Template:** Button opening a dialog to select columns (Name, Phone, Email, etc.) for a new custom template.
    -   **Export CSV:** The primary action to download the selected list.

**List Preview (Bottom):**
-   **Table:** Displays the first few rows of the selected list (Name, Category, City, Rating) to verify content before export.

### Functionality
-   **List Management:** Users can organize leads into distinct lists (e.g., "Cold Outreach Q1").
-   **Custom Exports:** The template system allows users to define exactly which JSON fields map to CSV columns, useful for importing into specific CRMs.
-   **Data Fetching:** Fetches list metadata and list items dynamically.

### Functions Inventory
-   `handleCreateTemplate()`: Saves a new export configuration.
-   `handleExport()`: Clients-side CSV generation based on the selected leads and template columns.

---

## 8. Company / About Page (`src/app/company/page.tsx`)

**Page:** `CompanyPage`
**Path:** `/company`

### UI Description
-   **Mission Section:** Large typography stating the company's goal ("Democratize access to public business data").
-   **Story Section:** Text block explaining the origin (started in 2024 to solve manual prospecting).
-   **Contact Card:** A styled card with contact details:
    -   **Address:** Rajkot, Gujrat.
    -   **Email:** `patelnishant2006@gmail.com`.
    -   **Socials:** Links to GitHub and LinkedIn.

### Functionality
-   **Static Content:** Displays company information.
-   **Animations:** Uses `framer-motion` for reveal effects on scroll.

---

## 9. Admin Dashboard (`src/app/admin/page.tsx`)

**Page:** `AdminDashboard`
**Path:** `/admin`

### UI Description
**Stats Grid:**
-   **Cards:** 6 Cards displaying key metrics: Total Users, Suspended Users, Total Leads, Running Tasks, Active Tasks, Total Searches. Each has an icon and a trend indicator.

**Charts:**
-   **Lead Growth:** An Area Chart showing the volume of leads extracted over the last 7 days.
-   **System Activity:** A chart showing extraction and search operations over time.

**Insight Cards:**
-   **Plan Mix:** Breakdown of users by plan (Free vs Pro vs Premium).
-   **Top Users:** list of users with the most extracted leads, including a dropdown to change their plan directly.
-   **Task Status:** Count of tasks by status.
-   **Recent Signups:** List of the newest users.

**Control Panels:**
-   **Admin Controls:** Buttons for "Pause All Running Tasks" and "Resume Eligible Tasks" (Bulk actions).
-   **Task Monitor:** Live table of all running tasks across the system, with admin override buttons (Pause/Resume).
-   **Recent Logs:** A stream of system logs (Success/Failure statuses).

### Functionality
-   **Superuser Control:** Allows global management of the platform.
-   **Monitoring:** Provides real-time visibility into system load and user behavior.
-   **Bulk Actions:** Critical for maintenance (e.g., pausing everything before a deployment).

### Functions Inventory
-   `planMutation`: Updates a user's plan.
-   `taskStatusMutation`: Force-updates a specific task's status.
-   `bulkTaskMutation`: Pauses or resumes all tasks system-wide.

---

## 10. Admin Users Page (`src/app/admin/users/page.tsx`)

**Page:** `AdminUsersPage`
**Path:** `/admin/users`

### UI Description
-   **Filter Bar:** Inputs to search by name/email, and dropdowns to filter by Plan, Status (Suspended/Active), and Role.
-   **Users Table:**
    -   **User:** Name + Badges (Admin, Suspended).
    -   **Plan:** Current tier.
    -   **Bonus:** Extra credits assigned.
    -   **Usage:** Progress bar of usage vs limit.
    -   **Actions:**
        -   **Toggle Admin:** Grant/Revoke admin rights.
        -   **Suspend:** Ban/Unban user.
        -   **Manage Credits:** Opens a dialog to add/deduct bonus credits.

### Functionality
-   **User Management:** Full CRUD on user permissions and quotas.
-   **Credit System Override:** Admins can manually grant credits (e.g., for support compensation).

### Functions Inventory
-   `toggleAdminMutation`: Toggles admin flag.
-   `suspendMutation`: Toggles suspension status.
-   `updateCreditsMutation`: Adds or removes credits.

---

## 11. Admin Logs Page (`src/app/admin/logs/page.tsx`)

**Page:** `AdminLogsPage`
**Path:** `/admin/logs`

### UI Description
-   **Search Bar:** Filters logs by action name or user email.
-   **Log List:** A vertical feed of log entries.
-   **Log Item:**
    -   **Status Bar:** Green (Success) or Red (Fail) indicator.
    -   **Action Name:** e.g., "User Login", "Task Started".
    -   **User:** Who performed the action.
    -   **Timestamp:** Time of occurrence.

### Functionality
-   **Audit Trail:** Keeps a record of important system events for debugging and security.
-   **Filtering:** Client-side filtering of the fetched log list.

### Functions Inventory
-   `getAdminDashboardStatsAction`: Fetches the logs (reused from dashboard action).

