import { Container, Skeleton } from '@/components/ui/primitives';

export default function AccountLoading() {
    return (
        <Container className="max-w-6xl py-10 sm:py-14" aria-busy aria-label="Loading your account">
            <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.06] bg-surface p-5 sm:flex-row sm:items-center sm:p-8">
                <Skeleton className="size-20 rounded-full sm:size-24" />
                <div className="flex grow flex-col gap-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-9 w-56" />
                    <Skeleton className="h-4 w-72 max-w-full" />
                </div>
            </div>
            <div className="mt-8 grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="hidden flex-col gap-2 lg:flex">
                    {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton key={index} className="h-8 w-36" />
                    ))}
                </div>
                <div className="flex flex-col gap-6">
                    {[14, 10, 12].map((height) => (
                        <div
                            key={height}
                            className="rounded-2xl border border-white/[0.06] bg-surface p-5 sm:p-6"
                        >
                            <div className="flex items-start gap-4">
                                <Skeleton className="size-10 rounded-xl" />
                                <div className="flex grow flex-col gap-2">
                                    <Skeleton className="h-6 w-40" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                            <Skeleton
                                className="mt-5 w-full rounded-lg"
                                style={{ height: `${height / 2}rem` }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </Container>
    );
}
