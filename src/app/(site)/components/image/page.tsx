import type { Metadata } from 'next';
import { PageTransition } from '@/components/layout/page-transition';
import { ImageToBase64 } from '@/components/showcase/image-to-base64';
import { ShowcaseHeader } from '@/components/showcase/showcase-header';

export const metadata: Metadata = {
    title: '<Image2Base64/>',
    description: 'Turn any image into a Base64 data URL, right in the browser.',
};

export default function ImagePage() {
    return (
        <PageTransition>
            <div className="flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-10 px-4 py-10">
                <ShowcaseHeader title="<Image2Base64/>">
                    Pick an image and copy it as a data URL.
                </ShowcaseHeader>
                <ImageToBase64 />
            </div>
        </PageTransition>
    );
}
