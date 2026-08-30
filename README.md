# Multiverse 3D (formerly XR-Learn)

Multiverse 3D is an interactive, browser-based educational platform designed to teach users the fundamental concepts of 3D programming, Spatial Computing, and XR (Extended Reality) development using Unity C#. It bridges the gap between theoretical knowledge and practical application through a hands-on, split-pane IDE environment featuring live 3D visualizers.

---

## 🏗️ System Architecture

The application is built on a modern, decoupled microservices architecture designed for high performance and real-time 3D rendering.

### 1. Frontend (Client)
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (configured with a custom, premium dark-mode design system)
- **3D Rendering:** `three.js` mapped to React via `@react-three/fiber` and `@react-three/drei`
- **Code Editor:** Monaco Editor (configured for C# syntax highlighting and intellisense)
- **Role:** Handles all user interface interactions, authentications, scene rendering, layout resizing, and sending user-written C# code to the execution environment.

### 2. Code Execution Engine (.NET Server)
- **Framework:** C# .NET Core (running on `http://localhost:5058`)
- **Role:** Acts as the secure backend validation layer for the user's Unity C# code. It receives the code payloads from the frontend, compiles/lints the syntax, validates it against the specific challenge requirements, and returns the execution results and error logs to the client.

### 3. Data & Indexing Backend (Node.js)
- **Framework:** Node.js (`ingest.js`, `retrieve.js`)
- **Role:** Handles secondary data operations, potentially including AI contextual embeddings, data ingestion pipelines, and retrieval logic for theory modules and guides.

---

## 🔄 User Flow

### 1. Onboarding
1. **Authentication:** The user arrives at the visually rich Login/Signup page.
2. **Dashboard:** After authenticating, the user is presented with a dynamic "Bento Grid" dashboard showcasing the three main pillars of the platform: **Modules** (Learning), **Training**, and **Debugging**.

### 2. Core Workspaces
Regardless of the pillar chosen, the user is taken to a specialized workspace. Each workspace uses a highly responsive, resizable 3-pane layout:
- **Left Panel (The Guide):** Contains theory, hints, and instructions for the specific challenge or module. This panel is collapsible for a distraction-free coding experience.
- **Center Panel (The IDE):** A Monaco-powered code editor pre-configured for Unity C# where users write their logic (e.g., `TransformController.cs`).
- **Right Panel (The Visualizer):** A live WebGL Canvas powered by React Three Fiber that immediately simulates the results of the code. This panel can be expanded into an absolute fullscreen immersive overlay.

### 3. Learning Paths
- **Modules (Guided Learning):** Step-by-step interactive lessons covering concepts like 3D Coordinates, Scene Hierarchy, Lighting & Materials, Interaction Design, and Physics.
- **Training Arena (Challenges):** A sandbox environment where users are given tasks (e.g., "Calculate the midpoint between two cubes") and must write the C# code from scratch to satisfy automated unit tests.
- **Debugging Hub (Troubleshooting):** Users are presented with "broken" scenes (e.g., a static fan, faulty teleporter pad) via simulated JIRA-style tickets. They must identify the logic error in the provided C# script, fix it, and submit it for validation.

---

## 🚀 Getting Started Locally

The project requires all three microservices to be running concurrently for full functionality.

### 1. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Start the Node Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Start the .NET Server
```bash
cd server
dotnet restore
dotnet run --urls http://localhost:5058
```

Open your browser and navigate to the frontend local server port (typically `http://localhost:5173`) to experience Multiverse 3D!
