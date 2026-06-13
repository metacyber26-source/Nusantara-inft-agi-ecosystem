"use client";

import React, { type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("[v0] Error boundary caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Error boundary details:", errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
                <p className="text-sm text-muted-foreground">
                  The application encountered an unexpected error. Please try again.
                </p>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {this.state.error?.message || "Unknown error occurred"}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload
                </Button>
                <Button onClick={this.resetError} className="flex-1">
                  Go to Home
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                If the problem persists, please clear your browser cache and try again.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
