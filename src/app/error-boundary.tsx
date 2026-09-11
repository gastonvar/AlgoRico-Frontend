import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-xl font-semibold">Algo salió mal</h1>
          <p className="text-sm text-muted-foreground">Recargá la página para continuar.</p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
