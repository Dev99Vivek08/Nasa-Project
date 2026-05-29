import React, { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StarField from "./components/StarField";
import PageTransition from "./components/PageTransition";

import Home from "./pages/Home";
import APOD from "./pages/APOD";
import ISS from "./pages/ISS";
import Asteroids from "./pages/Asteroids";
import SolarSystem from "./pages/SolarSystem";
import About from "./pages/About";
import SpaceWeather from "./pages/SpaceWeather";

const queryClient = new QueryClient();

function Router() {
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/apod" component={APOD} />
        <Route path="/iss" component={ISS} />
        <Route path="/asteroids" component={Asteroids} />
        <Route path="/solar-system" component={SolarSystem} />
        <Route path="/space-weather" component={SpaceWeather} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <StarField />
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;