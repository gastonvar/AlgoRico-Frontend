import { Toaster as Sonner, type ToasterProps } from 'sonner';

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast border-border bg-card text-foreground',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
