import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-cyan-100 flex items-center justify-center p-6 font-mono">
          <div className="max-w-md w-full bg-slate-900 border border-cyan-500/50 p-6 rounded-2xl shadow-2xl text-center space-y-4">
            <h1 className="text-xl font-bold text-cyan-400 uppercase tracking-wider">
              System Diagnostic Alert
            </h1>
            <p className="text-xs text-cyan-200/80 leading-relaxed">
              An anomaly occurred during system initialization.
            </p>
            <div className="p-3 bg-slate-950 rounded border border-rose-900/50 text-rose-300 text-[11px] font-mono break-words text-left max-h-32 overflow-y-auto">
              {this.state.error?.message || 'Unknown render exception'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-all"
            >
              Reset Session State & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
