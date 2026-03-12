import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SubsidyList from "./pages/SubsidyList";
import SubsidyDetail from "./pages/SubsidyDetail";
import SubsidyCompare from "./pages/SubsidyCompare";
import EligibilityCheck from "./pages/EligibilityCheck";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/subsidies" component={SubsidyList} />
      <Route path="/subsidies/:id" component={SubsidyDetail} />
      <Route path="/compare" component={SubsidyCompare} />
      <Route path="/check" component={EligibilityCheck} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
