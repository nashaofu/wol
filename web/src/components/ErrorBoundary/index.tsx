import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorElement from '../ErrorElement';

export interface IErrorBoundaryProps {
  children: ReactNode;
}

export interface IErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<
IErrorBoundaryProps,
IErrorBoundaryState
> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    // eslint-disable-next-line no-console
    console.log(error, errorInfo);
  }

  render() {
    const { error } = this.state;
    const { children } = this.props;
    if (error) {
      // You can render any custom fallback UI
      return <ErrorElement message={error.message} />;
    }

    return children;
  }
}
