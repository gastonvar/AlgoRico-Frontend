import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { FulfillmentBadge, OrderStatusBadge } from '@/components/common/status-badges';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { cn } from '@/lib/utils';
import { addDays, eachDayOfMonthGrid, formatDateOnlyLocal, startOfWeekDate } from '@/utils/dates';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '@/types/domain';
import { fulfillmentLabels } from '@/utils/labels';

type View = 'month' | 'week' | 'day';

const VIEW_OPTIONS: { id: View; label: string }[] = [
  { id: 'month', label: 'Mes' },
  { id: 'week', label: 'Semana' },
  { id: 'day', label: 'Día' },
];

export function CalendarRoute() {
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<View>('month');
  const showMonthGrid = useLgUp();

  const range = useMemo(() => getRange(cursor, view), [cursor, view]);
  const calendar = useCalendar(range.from, range.to);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of calendar.data ?? []) {
      const list = map.get(event.eventDate) ?? [];
      list.push(event);
      map.set(event.eventDate, list);
    }
    return map;
  }, [calendar.data]);

  const heading =
    view === 'day'
      ? format(cursor, 'EEEE d MMMM yyyy', { locale: es })
      : format(cursor, 'MMMM yyyy', { locale: es });

  return (
    <div>
      <PageHeader title="Calendario" description="Los eventos del calendario son pedidos, no conversaciones." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div
          className="grid w-full grid-cols-3 rounded-lg border bg-muted p-0.5 sm:inline-flex sm:w-auto"
          role="group"
          aria-label="Vista"
        >
          {VIEW_OPTIONS.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={view === option.id ? 'default' : 'ghost'}
              aria-pressed={view === option.id}
              className="min-w-0 px-2"
              onClick={() => setView(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => setCursor(new Date())}>
            Hoy
          </Button>
          <Button size="sm" variant="ghost" aria-label="Anterior" onClick={() => setCursor(shift(cursor, view, -1))}>
            <ChevronLeft />
          </Button>
          <Button size="sm" variant="ghost" aria-label="Siguiente" onClick={() => setCursor(shift(cursor, view, 1))}>
            <ChevronRight />
          </Button>
        </div>
        <p className="w-full text-sm font-medium capitalize sm:w-auto">{heading}</p>
      </div>
      {calendar.isLoading ? <LoadingSkeleton /> : null}
      {calendar.error ? <ErrorState error={calendar.error} onRetry={() => void calendar.refetch()} /> : null}
      {calendar.data ? (
        view === 'month' && showMonthGrid ? (
          <MonthGrid range={range} cursor={cursor} eventsByDate={eventsByDate} />
        ) : (
          <ListView days={range.days} eventsByDate={eventsByDate} />
        )
      ) : null}
    </div>
  );
}

function useLgUp() {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(min-width: 1024px)').matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  return matches;
}

function getRange(cursor: Date, view: View) {
  if (view === 'day') {
    const day = formatDateOnlyLocal(cursor);
    return { from: day, to: day, days: [cursor] };
  }
  if (view === 'week') {
    const start = startOfWeekDate(cursor);
    const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    return { from: formatDateOnlyLocal(days[0] as Date), to: formatDateOnlyLocal(days[6] as Date), days };
  }
  const days = eachDayOfMonthGrid(cursor);
  const start = days[0] as Date;
  const end = days[days.length - 1] as Date;
  return { from: formatDateOnlyLocal(start), to: formatDateOnlyLocal(end), days };
}

function shift(cursor: Date, view: View, amount: number) {
  if (view === 'day') return addDays(cursor, amount);
  if (view === 'week') return addDays(cursor, amount * 7);
  return new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1);
}

function MonthGrid({
  range,
  cursor,
  eventsByDate,
}: {
  range: { days: Date[] };
  cursor: Date;
  eventsByDate: Map<string, CalendarEvent[]>;
}) {
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const todayKey = formatDateOnlyLocal(new Date());
  const month = cursor.getMonth();
  return (
    <div className="grid w-full grid-cols-7 gap-px overflow-hidden rounded-xl border bg-border">
      {weekDays.map((day) => (
        <div key={day} className="bg-muted px-1 py-1.5 text-center text-xs font-medium">
          {day}
        </div>
      ))}
      {range.days.map((day) => {
        const key = formatDateOnlyLocal(day);
        const events = eventsByDate.get(key) ?? [];
        const isToday = key === todayKey;
        const inMonth = day.getMonth() === month;
        return (
          <div
            key={key}
            className={cn('min-h-20 min-w-0 bg-card p-1', !inMonth && 'bg-muted/40 text-muted-foreground')}
          >
            <p className={cn('text-xs', isToday && 'font-semibold text-primary')}>{format(day, 'd')}</p>
            <div className="mt-1 space-y-0.5">
              {events.map((event) => (
                <EventChip key={event.id} event={event} compact />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({
  days,
  eventsByDate,
}: {
  days: Date[];
  eventsByDate: Map<string, CalendarEvent[]>;
}) {
  const hasEvents = days.some((day) => (eventsByDate.get(formatDateOnlyLocal(day)) ?? []).length > 0);
  if (!hasEvents) {
    return <EmptyState title="No hay pedidos en este período." description="Los pedidos con fecha van a aparecer acá." />;
  }
  return (
    <div className="space-y-3">
      {days.map((day) => {
        const key = formatDateOnlyLocal(day);
        const events = eventsByDate.get(key) ?? [];
        if (events.length === 0) return null;
        return (
          <section key={key} className="rounded-xl border bg-card p-3 sm:p-4">
            <h2 className="text-sm font-medium capitalize sm:text-base">{format(day, 'EEEE d MMMM', { locale: es })}</h2>
            <div className="mt-2 space-y-2">
              {events.map((event) => (
                <EventChip key={event.id} event={event} detailed />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EventChip({
  event,
  detailed = false,
  compact = false,
}: {
  event: CalendarEvent;
  detailed?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      to={`/orders/${event.id}`}
      className={cn(
        'block rounded-md bg-primary/10 px-2 py-1 text-xs hover:bg-primary/20',
        compact && 'truncate px-1 py-0.5',
      )}
    >
      <span className="font-medium">{event.eventTime ? event.eventTime.slice(0, 5) : 'Sin hora'}</span>
      <span className="ml-1">{event.clientName}</span>
      {detailed ? (
        <span className="mt-1 flex flex-wrap gap-1">
          <span>{event.description || 'Pedido'}</span>
          <FulfillmentBadge type={event.fulfillmentType} />
          <OrderStatusBadge status={event.status} />
        </span>
      ) : compact ? null : (
        <span className="ml-1 text-muted-foreground">
          {fulfillmentLabels[event.fulfillmentType as 'PICKUP' | 'DELIVERY'] ?? event.fulfillmentType}
        </span>
      )}
    </Link>
  );
}
