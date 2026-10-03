import { TrafficLight } from '@/components/ui/status';
import { APP_STATUS_META, APP_STATUSES } from '@/lib/domain';

export { VisibilityDemo } from './visibility-demo';

/** Cycles through the three status lights with a CSS animation (see `.status-cycle` in globals.css). */
export function StatusCycler() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-5 rounded-xl bg-raised py-8">
            <div aria-hidden className="status-cycle grid">
                {APP_STATUSES.map((status) => (
                    <TrafficLight
                        key={status}
                        status={status}
                        scale={2.4}
                        className="col-start-1 row-start-1 gap-6"
                    />
                ))}
            </div>
            <p aria-hidden className="status-cycle grid font-pixel-sm text-sm text-muted">
                {APP_STATUSES.map((status) => (
                    <span key={status} className="col-start-1 row-start-1 text-center">
                        {APP_STATUS_META[status].label}
                    </span>
                ))}
            </p>
            <p className="sr-only">The status lights cycle through Ready, Under construction and Disabled.</p>
        </div>
    );
}
