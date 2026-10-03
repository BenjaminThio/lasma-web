import 'server-only';
import { unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/action-types';
import { AppError, FieldError } from '@/server/errors';
import { logger } from '@/server/logger';

/** Runs an action body and converts failures into a serializable `ActionResult`. */
export async function runAction<T>(name: string, body: () => Promise<T>): Promise<ActionResult<T>> {
    try {
        return { ok: true, data: await body() };
    } catch (error) {
        unstable_rethrow(error);

        if (error instanceof FieldError) {
            return { ok: false, error: error.message, fieldErrors: { [error.field]: error.message } };
        }
        if (error instanceof AppError) {
            return { ok: false, error: error.message };
        }

        logger.error(`Server action "${name}" failed`, { error });
        return { ok: false, error: 'Something went wrong. Please try again.' };
    }
}
