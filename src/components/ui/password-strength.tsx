import { cn } from '@/lib/cn';
import type { PasswordAssessment } from '@/lib/password-policy';

const SEGMENT_COLORS = ['bg-danger', 'bg-danger', 'bg-building', 'bg-accent', 'bg-ready'] as const;
const LABEL_COLORS = ['text-danger', 'text-danger', 'text-building', 'text-accent', 'text-ready'] as const;

interface PasswordStrengthProps {
    assessment: PasswordAssessment;
    /** Hidden until something is typed. */
    visible: boolean;
    id?: string;
    className?: string;
}

/** Four-segment strength bar with a label and one concrete tip. Announced politely as it changes. */
export function PasswordStrength({ assessment, visible, id, className }: PasswordStrengthProps) {
    const { score, label, suggestion, acceptable } = assessment;
    const filled = visible ? Math.max(1, score) : 0;

    return (
        <div id={id} className={cn('flex w-full flex-col gap-1.5', className)}>
            <div aria-hidden className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((segment) => (
                    <span
                        key={segment}
                        className={cn(
                            'h-1.5 rounded-full transition-colors duration-300',
                            segment <= filled ? SEGMENT_COLORS[score] : 'bg-white/10',
                        )}
                    />
                ))}
            </div>
            <p aria-live="polite" className="min-h-[1.25rem] font-pixel-sm text-xs leading-tight text-muted">
                {visible ? (
                    <>
                        <span className={LABEL_COLORS[score]}>{label}</span>
                        {suggestion ? ` · ${suggestion}` : acceptable ? ' · Looks good.' : null}
                    </>
                ) : (
                    'Use 8 or more characters. Longer is stronger.'
                )}
            </p>
        </div>
    );
}
