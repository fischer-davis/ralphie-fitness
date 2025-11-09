import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./style.css";
import { TRPCProvider } from "./lib/trpc-provider";
import { ThemeProvider } from "./components/theme-provider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    session: undefined!,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="ralphie-fitness-theme">
    <TRPCProvider>
      <RouterProvider router={router} />
    </TRPCProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("app")!).render(<App />);
