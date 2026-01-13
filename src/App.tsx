import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import SortingVisualizer from "./pages/SortingVisualizer";
import SearchingVisualizer from "./pages/SearchingVisualizer";
import GraphVisualizer from "./pages/GraphVisualizer";
import TreeVisualizer from "./pages/TreeVisualizer";
import StackVisualizer from "./pages/StackVisualizer";
import QueueVisualizer from "./pages/QueueVisualizer";
import LinkedListVisualizer from "./pages/LinkedListVisualizer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="dsa-visualizer-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sorting" element={<SortingVisualizer />} />
              <Route path="/searching" element={<SearchingVisualizer />} />
              <Route path="/graph" element={<GraphVisualizer />} />
              <Route path="/tree" element={<TreeVisualizer />} />
              <Route path="/stack" element={<StackVisualizer />} />
              <Route path="/queue" element={<QueueVisualizer />} />
              <Route path="/linked-list" element={<LinkedListVisualizer />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
