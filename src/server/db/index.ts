import 'server-only';
import { resolveDataDriver } from '@/server/env';
import { logger } from '@/server/logger';
import { getFirestoreClient } from './firestore/client';
import { createFirestoreRepositories } from './firestore/repositories';
import { createMemoryRepositories } from './memory/repositories';
import type { Repositories } from './types';

let repositories: Repositories | undefined;

/** The single entry point to persistence. Nothing outside `src/server` may import from here. */
export function db(): Repositories {
    if (repositories) return repositories;

    const driver = resolveDataDriver();

    if (driver === 'firestore') {
        repositories = createFirestoreRepositories(getFirestoreClient());
    } else {
        repositories = createMemoryRepositories();
        logger.warn(
            'Using the in-memory data store: no Firebase Admin credentials were found. Data resets when the server restarts.',
        );
    }

    return repositories;
}
