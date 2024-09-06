import { Component, ErrorInfo, ReactNode } from "react";
import ErrorElement from "../ErrorElement";

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    const { error } = this.state;
    // eslint-disable-next-line react/prop-types
    const { children } = this.props;
    if (error) {
      // You can render any custom fallback UI
      return <ErrorElement message={error.message} />;
    }

    return children;
  }
}
