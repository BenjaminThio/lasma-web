import { Container, LoadingDots, Skeleton } from '@/components/ui/primitives';

export default function ConsoleLoading() {
    return (
        <Container className="max-w-7xl py-10 font-mars-mono sm:py-14" aria-busy="true">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="animate-breathe text-3xl sm:text-4xl">
                    Fetching user data
                    <LoadingDots />
                </p>
                <div className="flex gap-2">
                    <Skeleton className="size-10 rounded-full" />
                    <Skeleton className="h-10 w-28 rounded-lg" />
                </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 md:gap-[5px]">
                <Skeleton className="hidden h-20 rounded-b-none md:block" />
                {Array.from({ length: 6 }, (_, index) => (
                    <Skeleton
                        key={index}
                        className="h-40 rounded-xl md:h-20 md:rounded-none md:last:rounded-b-lg"
                    />
                ))}
            </div>
        </Container>
    );
}
