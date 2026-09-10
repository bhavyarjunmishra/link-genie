# 🔗 Link-Genie — Full-Stack Edge URL Shortener

Link-Genie is a modern, full-stack URL shortening utility built with an edge-first architecture. It delivers fast, globally distributed redirects and frictionless, anonymous link shortening with persistent database storage.

🚀 **Live Deployment:** [https://link-genie.pages.dev](https://link-genie.pages.dev)  
📦 **Source Code:** [https://github.com/bhavyarjunmishra/link-genie](https://github.com/bhavyarjunmishra/link-genie)

---

## ✨ Features

- **Instant URL Shortening:** Zero-friction shortening without mandatory auth walls or sign-up barriers.
- **Edge Redirection:** Low-latency server-side redirects powered by Cloudflare Workers.
- **Persistent Data Layer:** Links, slugs, and timestamps mapped securely in PostgreSQL.
- **Responsive UI:** Clean, modern dashboard built with Tailwind CSS and responsive layout standards.

---

## 🛠️ Tech Stack & Tooling

### **Core Stack**
- **Frontend Framework:** [TanStack Start](https://tanstack.com/start) / React 18
- **Language:** TypeScript
- **Bundler & Build Tool:** Vite
- **Server Engine:** Nitro (Cloudflare Workers preset)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL)
- **Styling:** Tailwind CSS

### **Development & AI Tooling**
- **Lovable.dev:** Used as an AI scaffolding engine to rapidly prototype the full-stack starter template, initial UI components, and Supabase integration logic.
- **VS Code:** Local code editing, refactoring, and environment variable configuration.
- **Git & GitHub:** Version control, branch management, and repository hosting.
- **Cloudflare Workers / Pages:** Edge deployment pipeline, serverless compute runtime, and production CI/CD execution.

---

## 🧠 Engineering & Architecture Highlights

- **AI-Assisted Prototyping to Production Code:** While the baseline scaffolding was accelerated using Lovable, the application was manually refactored to remove external OAuth dependencies, clean up lockfiles, resolve duplicate plugin declarations, and shift to an open-access model.
- **Edge Deployment Debugging:** Migrated from static GitHub Pages deployment to Cloudflare Workers to properly support Nitro’s Server-Side Rendering (SSR) runtime and server routes.
- **CI/CD Pipeline Optimization:** Resolved frozen lockfile conflicts across package managers (switching between Bun and npm build environments) to ensure deterministic edge builds.
- **Environment & Secret Isolation:** Bound public project URLs and sensitive publishable keys securely via Cloudflare’s encrypted environment variables while preventing `.env` leakage in version control.

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/bhavyarjunmishra/link-genie.git](https://github.com/bhavyarjunmishra/link-genie.git)
   cd link-genie
