import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-background mesh-bg">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="orb orb-1 -top-48 -right-48" />
            <div className="orb orb-2 top-1/2 -left-32" />
          </div>
          <div className="glass-card p-8 sm:p-12 rounded-2xl max-w-md text-center relative z-10 space-y-5">
            <div className="w-16 h-16 rounded-2xl glass mx-auto flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <Button onClick={this.handleReload} className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
