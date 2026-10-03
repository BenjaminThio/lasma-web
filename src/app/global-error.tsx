'use client';

import './globals.css';

/** Last-resort boundary when the root layout itself fails. Keeps dependencies to a minimum. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en">
            <body className="flex min-h-svh flex-col items-center justify-center gap-6 bg-canvas px-4 text-center font-mono text-white">
                <h1 className="text-3xl">LASMA hit an unexpected error.</h1>
                <p className="text-muted">Please reload the page.</p>
                <button type="button" onClick={reset} className="rounded-lg bg-accent px-5 py-3 text-canvas">
                    Reload
                </button>
            </body>
        </html>
    );
}
