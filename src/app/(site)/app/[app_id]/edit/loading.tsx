import { Skeleton } from '@/components/ui/primitives';

export default function EditAppLoading() {
    return (
        <div
            className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center gap-8 px-4 py-10 sm:py-14"
            aria-busy="true"
        >
            <Skeleton className="h-10 w-40 rounded-xl" />
            <Skeleton className="h-[25.5rem] w-72 rounded-3xl sm:h-[29.75rem] sm:w-84 lg:h-[34rem] lg:w-96" />
            <Skeleton className="h-5 w-full max-w-md" />
        </div>
    );
}
