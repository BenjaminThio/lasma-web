import 'server-only';
import { applicationDefault, cert, getApps, initializeApp, type Credential } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { env } from '@/server/env';

const globalForFirestore = globalThis as typeof globalThis & { __lasmaFirestore?: Firestore };

function resolveCredential(): Credential | undefined {
    if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
        return cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            // .env files usually store the key on one line with literal "\n" sequences.
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        });
    }

    // The emulator accepts unauthenticated requests; everywhere else fall back to ADC.
    return env.FIRESTORE_EMULATOR_HOST ? undefined : applicationDefault();
}

/** A single Firestore Admin client per server process (survives dev hot reloads). */
export function getFirestoreClient(): Firestore {
    if (globalForFirestore.__lasmaFirestore) return globalForFirestore.__lasmaFirestore;

    const credential = resolveCredential();
    const app =
        getApps()[0] ??
        // `credential` must be omitted entirely (not `undefined`) when running against the emulator.
        initializeApp({ projectId: env.FIREBASE_PROJECT_ID, ...(credential ? { credential } : {}) });

    const firestore = getFirestore(app);
    // Default gRPC transport: verified under Bun and Node, and the only one that works with the emulator.
    firestore.settings({ ignoreUndefinedProperties: true });

    globalForFirestore.__lasmaFirestore = firestore;
    return firestore;
}
