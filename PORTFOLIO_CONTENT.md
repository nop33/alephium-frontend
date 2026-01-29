# Architecture & Engineering Decisions

## High-Level Overview

The Alephium Desktop Wallet is built within a **monorepo** architecture (using TurboRepo and pnpm), which also houses the mobile wallet and explorer. This structure was chosen to maximize code reuse across platforms. Core business logic, cryptography, and shared UI components are abstracted into internal packages (`@alephium/shared`, `@alephium/shared-react`), ensuring consistency between the Electron-based desktop app and the React Native mobile app.

The desktop application itself leverages **Electron** to deliver a cross-platform experience using web technologies. The frontend is built with **React 19** and **TypeScript**, bundled with **Vite** for a modern, performant development experience.

## Major Subsystems & Responsibilities

### 1. The Main Process (Electron)
The Main process acts as the secure orchestrator of the application. It is responsible for:
*   **System Integration:** Managing native window lifecycles, application menus, and auto-updates (via `electron-updater`).
*   **Security Boundary:** It strictly enforces a **Context Isolation** model. No Node.js APIs are directly exposed to the Renderer process. Instead, a specific set of safe APIs is exposed via a `ContextBridge` in `preload.ts`.
*   **Deep Linking:** Handling `alephium://` protocol links, particularly for WalletConnect integration.
*   **Hardware Interaction:** Managing communication with Ledger hardware wallets via Node.js HID libraries (`@ledgerhq/*`).

### 2. The Renderer Process (React)
The Renderer handles the UI and user interaction. It operates as a standard Single Page Application (SPA) but with access to the specific Electron APIs exposed by the Main process.
*   **State Management:**
    *   **Redux Toolkit:** Manages synchronous client-side state, such as the list of imported wallets, user settings, and contacts.
    *   **React Query (@tanstack/react-query):** Manages asynchronous server state. It handles fetching, caching, and synchronizing blockchain data from the Alephium network. This separation ensures that UI state (loading, error, success) is decoupled from the raw global store.
*   **UI Framework:** Built with `styled-components` and a custom component library found in `@alephium/shared-react`.
*   **Navigation:** Uses `react-router-dom` for client-side routing within the wallet interface.

### 3. Data Flow & Persistence
*   **Blockchain Data:** The app connects to the Alephium network using `@alephium/web3`. Data is fetched over HTTP/WebSocket, cached by React Query, and displayed to the user. This data is treated as ephemeral and re-fetched as needed.
*   **User Persistence:** Sensitive user data (like encrypted keys) and preferences are persisted locally using **`localStorage`**, managed via a custom `PersistentArrayStorage` adapter hooked into Redux.
*   **Asset Caching:** For performance-heavy assets, specifically video thumbnails for NFTs, the application utilizes **`IndexedDB`**. This prevents blocking the main thread and avoids local storage quota limits.
*   **IPC (Inter-Process Communication):** Communication between the Main and Renderer processes occurs strictly through asynchronous IPC channels (`ipcMain.handle` / `ipcRenderer.invoke`). This is used for tasks that require native privileges, such as "Quit App", "Check for Updates", or "Connect to Ledger".

## Key Engineering Tradeoffs

*   **Monorepo Complexity vs. Reuse:** Adopting a monorepo increases build tooling complexity (configuring Turbo, pnpm workspaces). However, this is outweighed by the ability to share complex cryptographic logic and UI components between the Desktop (React) and Mobile (React Native) projects, significantly reducing bug surface area and duplication.
*   **Electron Size vs. Velocity:** Using Electron results in a larger application bundle size compared to a native C++ or Swift application. This tradeoff was accepted to leverage the team's strong web expertise (React/TS) and to maintain a single codebase for Windows, macOS, and Linux.
*   **Local Persistence vs. Cloud:** As a non-custodial wallet, all keys and sensitive data are stored strictly on the user's device. There is no backend database for user accounts. This simplifies the backend architecture but places a higher burden on the client-side engineering to ensure robust local data migration and encryption.
