import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { Metadata } from "next";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Database, Webhook, Sheet, Zap, Shield, Clock, CheckCircle, ArrowUpRight, Code, FileText, Settings, RefreshCw } from "lucide-react";
import { LandingBanner } from "@/components/LandingBanner";

export const metadata: Metadata = {
  title: "Documentation | LeadSpotter - Integrations, Webhooks & API",
  description: "Learn how to integrate LeadSpotter with Google Sheets, Webhooks, and automate your lead workflow. Complete developer documentation.",
};

const sections = [
  {
    id: "overview",
    title: "Overview",
    icon: <FileText className="w-5 h-5" />,
    content: `LeadSpotter provides powerful integrations to automate your lead workflow. Connect with Google Sheets, receive real-time webhooks, and sync data with your favorite tools.`
  },
  {
    id: "googlesheets",
    title: "Google Sheets Integration",
    icon: <Sheet className="w-5 h-5" />,
    content: `Sync your extracted leads directly to Google Sheets for easy analysis and sharing.`
  },
  {
    id: "webhooks",
    title: "Webhooks",
    icon: <Webhook className="w-5 h-5" />,
    content: `Receive real-time notifications when new leads are extracted or updated.`
  },
  {
    id: "api",
    title: "API Reference",
    icon: <Code className="w-5 h-5" />,
    content: `Build custom integrations with our REST API.`
  }
];

const features = [
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Manual Export",
    description: "You're in control. Select task, choose leads, then export when ready.",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Transfer",
    description: "All data is encrypted during transfer using industry-standard protocols.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "On-Demand Webhooks",
    description: "Trigger webhooks manually after selecting leads from your task.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Data Enrichment",
    description: "Additional fields like social profiles and business data are automatically added.",
    color: "from-orange-500 to-amber-500"
  }
];

export default function DocsPage() {
  return (
    <div className="bg-white text-gray-900 antialiased">
      <LandingBanner />
      <LandingHeader />
      {/* Hero Section */}
      <section className="relative py-20 pt-48 md:pt-52  md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 via-white to-white" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-200/30 via-purple-200/30 to-indigo-200/30 blur-[120px] rounded-full" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-8">
              <FileText className="w-4 h-4" />
              Developer Documentation
            </div>
             <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
             Integrations <br /><span className="text-indigo-600">Documentation</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-500 text-lg">
              Connect LeadSpotter with Google Sheets and webhooks. You control the flow — select your task, choose leads, then export or send to your preferred destination.
            </p>
            <div className="flex mt-12 flex-wrap justify-center gap-4">
              <Link href="/signup">
                <button className="text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)" }}>
                  Get Started Free
                </button>
              </Link>
              <a href="#googlesheets" className="">
                <button className="px-6 py-3 rounded-full text-sm font-bold border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  View Integrations
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-100/50 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Sheets Integration */}
      <section id="googlesheets" className="py-16 md:py-24 bg-gradient-to-b from-indigo-50/30 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-200/50">
                <Sheet className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Google Sheets Integration</h2>
                <p className="text-gray-600">Sync leads directly to your spreadsheets</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  How It Works
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">1</span>
                    <span className="text-gray-700">Go to Settings → Integrations → Google Sheets</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">2</span>
                    <span className="text-gray-700">Click "Connect Google Sheets" and authorize</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">3</span>
                    <span className="text-gray-700">Select which task's leads you want to export</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold">4</span>
                    <span className="text-gray-700">Click "Export to Google Sheets" to sync selected leads</span>
                  </li>
                </ol>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-indigo-500" />
                  Manual Export Process
                </h3>
                <p className="text-gray-600 mb-4">
                  Unlike auto-sync, you have full control. Choose exactly which leads to export:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Select specific tasks to export leads from
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Filter leads before exporting (by rating, location, etc.)
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Choose target Google Sheet or create new one
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Export anytime after extraction is complete
                  </li>
                </ul>
              </div>
            </div>

            {/* Google Sheets Code Example */}
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-400 text-sm ml-4">Example: How leads appear in Google Sheets</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-gray-300">
                  {`| Business Name      | Address            | Phone      | Email              | Website | Rating |
|--------------------|--------------------|------------|--------------------|---------|--------|
| Joe's Pizza        | 123 Main St, NYC   | +1-555-123 | joe@joespizza.com  | joe...  | 4.5    |
| Metro Dental Care  | 456 Oak Ave, LA    | +1-555-456 | info@metroden...   | metro...| 4.8    |
| Tech Solutions Inc | 789 Pine Rd, SF    | +1-555-789 | hello@techsol...    | tech... | 4.2    |`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Webhooks Section */}
      <section id="webhooks" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-200/50">
                <Webhook className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Webhooks</h2>
                <p className="text-gray-600">Get real-time notifications for new leads</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4">What are Webhooks?</h3>
                <p className="text-gray-600 mb-4">
                  Webhooks allow you to receive real-time HTTP notifications when events occur in LeadSpotter.
                  Instead of polling our API, your server receives instant updates.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-violet-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Instant Delivery</p>
                      <p className="text-sm text-gray-600">Receive leads as soon as they're extracted</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-violet-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Custom Endpoints</p>
                      <p className="text-sm text-gray-600">Point to any URL you control</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Supported Events</h3>
                <div className="space-y-3">
                  {[
                    { name: "lead.created", desc: "New lead extracted" },
                    { name: "lead.updated", desc: "Lead data changed" },
                    { name: "extraction.started", desc: "Extraction job started" },
                    { name: "extraction.completed", desc: "Extraction job finished" },
                  ].map((event) => (
                    <div key={event.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <code className="text-sm font-mono text-violet-600">{event.name}</code>
                      <span className="text-sm text-gray-500">{event.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Webhook Payload Example */}
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 overflow-hidden mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-gray-400 text-sm">POST to your endpoint</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-gray-300">{`{
  "event": "lead.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "lead_abc123",
    "business_name": "Joe's Pizza",
    "address": "123 Main Street, New York, NY 10001",
    "phone": "+1-555-123-4567",
    "email": "contact@joespizza.com",
    "website": "https://joespizza.com",
    "rating": 4.5,
    "review_count": 234,
    "category": "Pizza Restaurant",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "maps_url": "https://maps.google.com/...",
    "extraction_job_id": "job_xyz789"
  }
}`}</code>
              </pre>
            </div>

            {/* Webhook Setup Steps */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-8 border border-indigo-100">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                Setting Up Webhooks
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">1</div>
                  <h4 className="font-bold text-gray-900 mb-2">Configure Endpoint</h4>
                  <p className="text-sm text-gray-600 mb-3">Go to Settings → Integrations → Webhooks and add your endpoint URL</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-violet-600">https://your-server.com/webhook</code>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">2</div>
                  <h4 className="font-bold text-gray-900 mb-2">Select Task</h4>
                  <p className="text-sm text-gray-600 mb-3">Choose which task's leads should trigger webhook notifications</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-violet-600">Task: Pizza NYC</code>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">3</div>
                  <h4 className="font-bold text-gray-900 mb-2">Send to Webhook</h4>
                  <p className="text-sm text-gray-600 mb-3">Click "Send to Webhook" button after selecting leads from task</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-violet-600">Send Selected Leads</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="py-16 md:py-24 bg-gradient-to-b from-white to-indigo-50/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
                <Code className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">API Reference</h2>
                <p className="text-gray-600">Build custom integrations with our REST API</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">GET</span>
                <code className="text-gray-700 font-mono">/api/leads</code>
                <span className="text-gray-500 text-sm">Fetch all leads for authenticated user</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">POST</span>
                <code className="text-gray-700 font-mono">/api/extraction/start</code>
                <span className="text-gray-500 text-sm">Start a new extraction job</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">POST</span>
                <code className="text-gray-700 font-mono">/api/extraction/stop</code>
                <span className="text-gray-500 text-sm">Stop a running extraction job</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">PUT</span>
                <code className="text-gray-700 font-mono">/api/integrations/webhook</code>
                <span className="text-gray-500 text-sm">Update webhook configuration</span>
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-gray-900 rounded-2xl p-6 md:p-8 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-400 text-sm ml-4">Authentication Example</span>
              </div>
              <pre className="text-sm overflow-x-auto">
                <code className="text-gray-300">{`# Include your API key in the header
curl -X GET "https://api.leadspotter.in/v1/leads" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Ready to Automate Your Lead Workflow?
            </h2>
            <p className="text-gray-600 text-lg mb-10">
              Start extracting leads and sending them to your favorite tools in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <button className="text-white px-8 py-3 rounded-full text-sm font-bold shadow-lg shadow-indigo-200/50 active:scale-95 transition-all flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #3B82F6 100%)" }}>
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/integrations">
                <button className="px-8 py-3 rounded-full text-sm font-bold border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2">
                  View All Integrations <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
