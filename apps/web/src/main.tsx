import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { TRPCProvider } from "./lib/trpc-provider";
import { Header, Counter } from "@repo/ui";

const App = () => (
  <TRPCProvider>
    <div className="min-h-screen bg-background text-foreground">
      <Header title="Ralphie Fitness" />
      <main className="container mx-auto p-4">
        <div className="card">
          <Counter />
        </div>
      </main>
    </div>
  </TRPCProvider>
);

createRoot(document.getElementById("app")!).render(<App />);
