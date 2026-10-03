import { APP_GRID_CLASSES, AppCardSkeleton } from '@/components/apps/app-card';
import { Container, Skeleton } from '@/components/ui/primitives';

export default function AppsLoading() {
    return (
        <Container className="py-10 sm:py-14" aria-busy="true" aria-label="Loading apps">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-5 w-full max-w-md" />
            </div>
            <ul className={APP_GRID_CLASSES}>
                {Array.from({ length: 12 }, (_, index) => (
                    <li key={index} className="flex w-full justify-center">
                        <AppCardSkeleton />
                    </li>
                ))}
            </ul>
        </Container>
    );
}
