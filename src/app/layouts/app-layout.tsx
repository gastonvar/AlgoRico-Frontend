import { CalendarDays, ChevronLeft, ClipboardList, CookingPot, LayoutDashboard, LogOut, Plus, ShoppingBag, Users, Wheat } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BrandLogo } from '@/components/common/brand-logo';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clientes', icon: Users, end: false },
  { to: '/orders', label: 'Pedidos', icon: ShoppingBag, end: false },
  { to: '/recipes', label: 'Recetas', icon: CookingPot, end: false },
  { to: '/ingredients', label: 'Ingredientes', icon: Wheat, end: false },
  { to: '/calendar', label: 'Agenda', icon: CalendarDays, end: false },
  { to: '/tasks', label: 'Tareas', icon: ClipboardList, end: false },
];

const titles: Record<string, string> = {
  '/dashboard': 'Inicio',
  '/clients': 'Clientes',
  '/orders': 'Pedidos',
  '/recipes': 'Recetas',
  '/ingredients': 'Ingredientes',
  '/calendar': 'Agenda',
  '/tasks': 'Tareas',
};

function pageTitle(pathname: string): string {
  if (pathname.startsWith('/clients/')) return 'Cliente';
  if (pathname.startsWith('/orders/new')) return 'Nuevo pedido';
  if (pathname.match(/^\/orders\/[^/]+\/edit/)) return 'Editar pedido';
  if (pathname.startsWith('/orders/')) return 'Pedido';
  if (pathname.startsWith('/recipes/new')) return 'Nueva receta';
  if (pathname.match(/^\/recipes\/[^/]+\/edit/)) return 'Editar receta';
  if (pathname.startsWith('/recipes/')) return 'Receta';
  return titles[pathname] ?? 'Algo Rico';
}

function backTo(pathname: string): { to: string; label: string } | null {
  if (pathname === '/orders/new') return { to: '/orders', label: 'Pedidos' };
  if (pathname.match(/^\/orders\/[^/]+\/edit/)) {
    return { to: pathname.replace(/\/edit$/, ''), label: 'Pedido' };
  }
  if (pathname.match(/^\/orders\/[^/]+$/)) return { to: '/orders', label: 'Pedidos' };
  if (pathname.match(/^\/clients\/[^/]+$/)) return { to: '/clients', label: 'Clientes' };
  if (pathname === '/recipes/new') return { to: '/recipes', label: 'Recetas' };
  if (pathname.match(/^\/recipes\/[^/]+\/edit/)) {
    return { to: pathname.replace(/\/edit$/, ''), label: 'Receta' };
  }
  if (pathname.match(/^\/recipes\/[^/]+$/)) return { to: '/recipes', label: 'Recetas' };
  return null;
}

function navClassName({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    isActive && 'bg-primary/10 text-primary',
  );
}

function NavList() {
  return (
    <nav className="flex flex-col gap-1" aria-label="Principal">
      {navItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.end} className={navClassName}>
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function QuickActions() {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" aria-label="Nuevo">
          <Plus className="h-5 w-5" />
          <span className="sr-only">Nuevo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => navigate('/clients?new=1')}>Nuevo cliente</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/orders/new')}>Nuevo pedido</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/recipes/new')}>Nueva receta</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/ingredients?new=1')}>Nuevo ingrediente</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigate('/tasks?new=1')}>Nueva tarea</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <span className="hidden max-w-[12rem] truncate text-sm text-muted-foreground lg:inline">{user?.email}</span>
      <Button
        variant="ghost"
        size="icon"
        className="lg:w-auto lg:px-4"
        onClick={async () => {
          try {
            await logout.mutateAsync();
          } finally {
            navigate('/login', { replace: true });
          }
        }}
        aria-label="Cerrar sesión"
      >
        <LogOut className="h-5 w-5" />
        <span className="hidden lg:inline">Salir</span>
      </Button>
    </div>
  );
}

function MobileHeaderLead({ pathname }: { pathname: string }) {
  const back = backTo(pathname);
  if (back) {
    return (
      <Button asChild variant="ghost" size="icon" className="lg:hidden" aria-label={`Volver a ${back.label}`}>
        <Link to={back.to}>
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </Button>
    );
  }
  return <BrandLogo decorative className="h-9 w-9 shrink-0 lg:hidden" />;
}

function MobileTabBar() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] backdrop-blur lg:hidden"
    >
      <ul className="flex overflow-x-auto">
        {navItems.map((item) => (
          <li key={item.to} className="min-w-[4.5rem] flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium text-muted-foreground',
                  isActive && 'text-primary',
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const company = useAuthStore((state) => state.user?.company);

  return (
    <div className="min-h-svh bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden border-r bg-card px-4 py-6 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <BrandLogo decorative className="h-12 w-12 shrink-0" />
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight text-primary">
              {company?.name ?? 'Algo Rico'}
            </p>
            {company?.subtitle ? (
              <p className="text-xs text-muted-foreground">{company.subtitle}</p>
            ) : null}
          </div>
        </div>
        <NavList />
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/95 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] backdrop-blur lg:gap-3 lg:px-6 lg:py-3 lg:pt-[max(0.75rem,env(safe-area-inset-top))]">
          <MobileHeaderLead pathname={location.pathname} />
          <h1 className="min-w-0 flex-1 truncate text-base font-semibold lg:hidden">{pageTitle(location.pathname)}</h1>
          <div className="hidden flex-1 lg:block" />
          <QuickActions />
          <UserMenu />
        </header>
        <main className="flex-1 px-3 py-4 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
          {children ?? <Outlet />}
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
