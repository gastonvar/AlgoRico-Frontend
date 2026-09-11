import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { BrandLogo } from '@/components/common/brand-logo';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSpinner } from '@/components/ui/spinner';
import { useCurrentUser, useLogin } from '@/features/auth/hooks/use-auth';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/auth-schemas';
import { getErrorMessage } from '@/lib/api-error';
import { applyFieldErrors } from '@/lib/form-errors';

export function LoginRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const login = useLogin();
  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname &&
    (location.state as { from?: { pathname?: string } }).from?.pathname !== '/login'
      ? (location.state as { from: { pathname: string } }).from.pathname
      : '/dashboard';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (currentUser.isLoading) {
    return <PageSpinner>Comprobando sesión…</PageSpinner>;
  }

  if (currentUser.data) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    try {
      await login.mutateAsync(values);
      navigate(from, { replace: true });
    } catch (error) {
      applyFieldErrors(error, form.setError);
      form.setError('root', { message: getErrorMessage(error) });
    }
  }

  return (
    <main className="flex min-h-svh flex-col overflow-y-auto px-4 py-6 sm:py-10">
      <div className="mx-auto my-auto w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
        <BrandLogo variant="wordmark" className="mx-auto h-auto w-full max-w-[16rem]" />
        <p className="mt-1 text-center text-sm font-medium text-primary">Santa Lucía</p>
        <h1 className="mt-6 text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Ingresá para ver clientes, pedidos y el día de hoy.
        </p>
        <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <Field className="gap-2">
              <Label htmlFor="email" className="text-base">
                Correo
              </Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="next"
                {...form.register('email')}
              />
              <FieldError>{form.formState.errors.email?.message}</FieldError>
            </Field>
            <Field className="gap-2">
              <Label htmlFor="password" className="text-base">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                enterKeyHint="go"
                {...form.register('password')}
              />
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>
            <FieldError>{form.formState.errors.root?.message}</FieldError>
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting || login.isPending}
            >
              {form.formState.isSubmitting || login.isPending ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
      </div>
    </main>
  );
}
