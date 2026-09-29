import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_bGVhcm5pbmctZmxlYS03NS5jbGVyay5hY2NvdW50cy5kZXYk";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "30px", fontFamily: "sans-serif", maxWidth: "800px", margin: "40px auto", background: "#fef2f2", border: "1px solid #f87171", borderRadius: "12px", color: "#991b1b" }}>
          <h2 style={{ margin: "0 0 12px 0", fontSize: "22px" }}>⚠️ Application Error</h2>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#b91c1c" }}>
            {this.state.error?.message || "An unexpected error occurred while rendering the page."}
          </p>
          <pre style={{ background: "#ffffff", padding: "14px", borderRadius: "8px", overflowX: "auto", fontSize: "12px", border: "1px solid #fca5a5" }}>
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: "16px", padding: "10px 20px", background: "#059669", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </ErrorBoundary>
);
