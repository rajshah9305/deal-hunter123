import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Add web fonts
const fontLinks = [
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@400;500;600;700&display=swap",
  "https://fonts.googleapis.com/css2?family=SF+Pro+Text:wght@400;500;600&display=swap"
];

// Append font links to document head
fontLinks.forEach(href => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
});

// Set document title
document.title = "DealFlip - Premium AI-Driven Deal Platform";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
