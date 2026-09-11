import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function NotFoundRoute() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-2 text-center">
      <h1 className="text-2xl font-semibold">Página no encontrada</h1>
      <p className="text-sm text-muted-foreground">Esa ruta no existe.</p>
      <Button asChild className="w-full sm:w-auto">
        <Link to="/dashboard">Volver al inicio</Link>
      </Button>
    </div>
  );
}
