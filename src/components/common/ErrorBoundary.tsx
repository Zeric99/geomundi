import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error no controlado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 select-none">
          <div className="bg-[#18181B] border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 inline-flex shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100">
                Se produjo un problema al cargar esta sección
              </h2>
              <p className="text-sm text-zinc-400">
                Ocurrió un error inesperado al renderizar la vista. Puedes volver al menú principal o recargar la página.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 text-left font-mono text-xs text-rose-300/80 max-h-24 overflow-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Home className="w-4 h-4" />
                <span>Volver al Menú</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm transition flex items-center justify-center gap-2 border border-zinc-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recargar GeoStrike</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
