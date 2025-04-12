import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/lib/types";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    onSettled: () => {
      // Simulate a short loading delay to ensure smooth transition
      setTimeout(() => setIsLoading(false), 500);
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warmGrey">
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gold animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8v8H8V8h8m2-2H6v12h12V6z" />
            <path d="M14 2H4v12h2V4h8V2z" />
            <path d="M20 10h-2v8h-8v2h10V10z" />
          </svg>
          <h1 className="mt-4 text-2xl font-bold text-navy">Loading DealFlip...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
