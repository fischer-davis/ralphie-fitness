import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./style.css";
import { TRPCProvider } from "./lib/trpc-provider";

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
  <TRPCProvider>
    <RouterProvider router={router} />
  </TRPCProvider>
);

createRoot(document.getElementById("app")!).render(<App />);
