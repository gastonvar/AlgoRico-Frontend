import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { PageHeader } from '@/components/common/page-header';
import { PageSection } from '@/components/common/page-section';
import { FulfillmentBadge, OrderStatusBadge } from '@/components/common/status-badges';
import { useCalendar } from '@/features/calendar/hooks/use-calendar';
import { cn } from '@/lib/utils';
import { addDays, eachDayOfMonthGrid, formatDateOnlyLocal, startOfWeekDate } from '@/utils/dates';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent } from '@/types/domain';

type View = 'month' | 'week' | 'day';

const VIEW_OPTIONS: { id: View; label: string }[] = [
  { id: 'month', label: 'Mes' },
  { id: 'week', label: 'Semana' },
  { id: 'day', label: 'Día' },
];

const MONTH_CELL_CHIP_LIMIT = 3;

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
    for (const list of map.values()) {
      list.sort(compareEventsByTime);
    }
    return map;
  }, [calendar.data]);

  const heading = periodHeading(cursor, view, range);

  return (
    <div className="min-w-0">
      <PageHeader title="Calendario" description="Los eventos del calendario son pedidos, no conversaciones." />
      <nav
        aria-label="Período del calendario"
        className="sticky top-[3.25rem] z-20 -mx-3 mb-4 border-y bg-background/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 lg:top-[3.75rem] lg:mx-0 lg:rounded-xl lg:border lg:px-3"
      >
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-3">
          <div
            className="grid w-full shrink-0 grid-cols-3 rounded-lg border bg-muted p-0.5 lg:inline-flex lg:w-auto"
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
          <div className="flex min-w-0 items-center gap-1">
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => setCursor(new Date())}>
              Hoy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0"
              aria-label="Anterior"
              onClick={() => setCursor(shift(cursor, view, -1))}
            >
              <ChevronLeft />
            </Button>
            <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold lg:px-2 lg:text-left">
              {capitalizeHeading(heading)}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0"
              aria-label="Siguiente"
              onClick={() => setCursor(shift(cursor, view, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </nav>
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

function periodHeading(cursor: Date, view: View, range: { days: Date[] }) {
  if (view === 'day') {
    return format(cursor, "EEEE d 'de' MMMM yyyy", { locale: es });
  }
  if (view === 'week') {
    const start = range.days[0] as Date;
    const end = range.days[6] as Date;
    return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`;
  }
  return format(cursor, 'MMMM yyyy', { locale: es });
}

function compareEventsByTime(a: CalendarEvent, b: CalendarEvent) {
  return (a.eventTime ?? '99:99').localeCompare(b.eventTime ?? '99:99');
}

function eventTimeLabel(event: CalendarEvent) {
  return event.eventTime ? event.eventTime.slice(0, 5) : 'Sin hora';
}

function capitalizeHeading(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
        const visible = events.slice(0, MONTH_CELL_CHIP_LIMIT);
        const extra = events.length - visible.length;
        const isToday = key === todayKey;
        const inMonth = day.getMonth() === month;
        return (
          <div
            key={key}
            className={cn(
              'flex min-h-20 min-w-0 flex-col overflow-hidden bg-card p-1',
              !inMonth && 'bg-muted/40 text-muted-foreground',
              isToday && 'ring-1 ring-inset ring-primary/40',
            )}
          >
            <p className={cn('shrink-0 text-xs', isToday && 'font-semibold text-primary')}>{format(day, 'd')}</p>
            <div className="mt-1 min-w-0 space-y-0.5 overflow-hidden">
              {visible.map((event) => (
                <EventChip key={event.id} event={event} />
              ))}
              {extra > 0 ? (
                <p className="truncate px-1 text-[10px] leading-tight text-muted-foreground">+{extra}</p>
              ) : null}
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
  const todayKey = formatDateOnlyLocal(new Date());
  return (
    <div className="space-y-3">
      {days.map((day) => {
        const key = formatDateOnlyLocal(day);
        const events = eventsByDate.get(key) ?? [];
        if (events.length === 0) return null;
        const isToday = key === todayKey;
        return (
          <PageSection
            key={key}
            title={capitalizeHeading(format(day, "EEEE d 'de' MMMM", { locale: es }))}
            description={isToday ? 'Hoy' : undefined}
          >
            <div className="space-y-2">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </PageSection>
        );
      })}
    </div>
  );
}

function EventChip({ event }: { event: CalendarEvent }) {
  return (
    <Link
      to={`/orders/${event.id}`}
      className="block min-w-0 truncate rounded-md bg-primary/10 px-1 py-0.5 text-[10px] leading-tight hover:bg-primary/20"
    >
      <span className="font-medium">{eventTimeLabel(event)}</span>
      <span className="ml-1">{event.clientName}</span>
    </Link>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <Link
      to={`/orders/${event.id}`}
      className="block min-w-0 rounded-lg border bg-background p-3 hover:bg-accent/40"
    >
      <p className="text-sm font-semibold tabular-nums">{eventTimeLabel(event)}</p>
      <p className="mt-0.5 font-medium">{event.clientName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{event.description || 'Pedido'}</p>
      <span className="mt-2 flex flex-wrap gap-1">
        <FulfillmentBadge type={event.fulfillmentType} />
        <OrderStatusBadge status={event.status} />
      </span>
    </Link>
  );
}
