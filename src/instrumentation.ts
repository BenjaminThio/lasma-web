/**
 * Runs once when a server instance starts. Surfaces configuration problems in the logs right away
 * instead of on the first request that happens to need the missing piece.
 */
export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
    // Builds import this too; only a running server needs a data store.
    if (process.env.NEXT_PHASE === 'phase-production-build') return;

    const { deploymentWarnings, resolveDataDriver } = await import('@/server/env');
    const { logger } = await import('@/server/logger');

    for (const warning of deploymentWarnings()) logger.warn(warning);

    try {
        logger.info('Server starting', { dataDriver: resolveDataDriver() });
    } catch (error) {
        // Logged loudly, but not rethrown: health checks and static pages keep working while it's fixed.
        logger.error('The data store is not configured; pages that need it will fail', { error });
    }
}
