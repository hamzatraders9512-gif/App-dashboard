import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    // also log to console
    console.error("Captured error in ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, color: "#ffcc00", background: "#111", minHeight: "100vh" }}>
          <h2 style={{ color: "#fff" }}>An error occurred</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#ffd" }}>
            {String(this.state.error && this.state.error.toString())}
            {"\n\n"}
            {this.state.info?.componentStack}
          </pre>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            style={{ marginTop: 12, padding: "8px 12px" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}