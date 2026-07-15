# L&T Infrastructure Operations Control Center (IOCC) — Frontend Dashboard

A premium, state-of-the-art operations control dashboard designed to monitor large-scale construction sites, manage workforce role assignments, track safety incidents, and visualize real-time AI telemetry from edge devices and cameras.

Built with **React**, **TypeScript**, and **Vite** for optimized build performance, styled using custom modern CSS layouts and Bootstrap components.

---

## 📁 Project Structure

The project follows a modular, feature-oriented structure for clean division of concerns:

```text
lt-fe-v1/
├── dist/                     # Production build output
├── public/                   # Static assets (logos, icons)
├── src/                      # Application source code
│   ├── api/                  # API clients and integration layer
│   ├── assets/               # Local static images (L&T, KCIRI, and AI logos)
│   ├── components/           # Reusable UI component library
│   │   ├── cards/            # KPI metrics, AI alert cards, incident indicators
│   │   ├── charts/           # Incident trends and statistical analytics
│   │   ├── forms/            # DynamicForm components supporting inputs/files
│   │   ├── layout/           # Sidebar, Navbar, and theme wrappers
│   │   ├── tables/           # FilterableTable and ReusableDataTable modules
│   │   └── ui/               # Primary interactive UI controls
│   ├── config/               # App-wide configurations
│   ├── constants/            # Role options, statuses, and config lists
│   ├── contexts/             # Global states (Theme, AuthUser, Sidebar configs)
│   ├── data/                 # Local data schemas
│   ├── features/             # Business logic modules
│   ├── hooks/                # Custom React hook utilities
│   ├── layouts/              # Screen grids and route structural templates
│   ├── pages/                # High-level screens and form containers
│   ├── routes/               # Browser routing configurations
│   ├── services/             # Mock DB models and localStorage services
│   ├── store/                # Client-side state store (Zustand/Redux if applicable)
│   ├── styles/               # Global styling sheets and token variables
│   ├── types/                # TypeScript type definitions and interfaces
│   ├── utils/                # Date parsers, formatting helpers, and utilities
│   ├── App.tsx               # Root component loading routes and context
│   └── main.tsx              # React mounting entrypoint
├── eslint.config.js          # ESLint rules and parsing configurations
├── package.json              # Package dependency definitions and scripts
├── tsconfig.json             # TypeScript root configurations
└── vite.config.ts            # Vite compile and module bundling options
```

---

## 🌟 Key Core Features

### 🏢 Infrastructure Project Management
*   **Detailed View Popovers**: Clickable project links open a detailed modal overlay showing timelines, budget tracking, site configurations, and assigned personnel without context switching.
*   **Dynamic Role Assignment**: Support for adding multiple managers, site supervisors, site engineers, safety officers, and safety engineers, with specific site allocation limits for each person.
*   **Flexible Sites & Chainages**: Configure site codes, names, and chainage milestone markers (kilometer ranges) dynamically.
*   **Configurable Fallbacks**: Auto-generates timelines and links back to the selected Start Date.

### 👤 User & Access Control Directory
*   **Local Photo Uploader**: User forms support local file uploading. Images are read as base64 Data URLs and stored locally in the mock database with immediate thumbnail previews.
*   **Robust Delete Tables**: Bulk removal pages display detailed user profiles (employee ID, role, photo, joined dates, address) and projects (timelines, site configurations, role lists) before action approval.

### 📊 Diagnostics & System Health
*   **Cameras & Edge Tracking**: Displays total online vs. offline devices.
*   **Server Diagnostics**: Real-time progress bars for CPU/RAM usage featuring smooth sliding stripe animations, AI Latency tracking, and uptime metrics.
*   **Ping Hearts**: Concentric wave indicators pulsing in real-time to signal active edge node telemetry.

---

## 🛠️ Development & Commands

### Prerequisites
Make sure you have **Node.js** (v18+) and **npm** installed.

### Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Start Local Development Server**
    ```bash
    npm run dev
    ```
    *(Vite will spin up the local server with hot module replacement.)*

3.  **Build for Production**
    ```bash
    npm run build
    ```
    *(Outputs a minified, production-ready bundle to the `dist/` directory.)*

4.  **Lint Codebase**
    ```bash
    npm run lint
    ```
