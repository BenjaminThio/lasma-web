'use server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { GetAllUsers, UserProps } from '@/utils/firestore';
import { redirect } from 'next/navigation';

export type Cookies = {
    set: (
        key: string,
        value: string,
        options: {
            secure?: boolean,
            httpOnly?: boolean,
            sameSite: 'strict' | 'lax',
            expires?: number
        }) => void,
    get: (key: string) => {name: string, value: string} | undefined,
    delete: (key: string) => void
}

const SESSION_COOKIE_KEY: string = 'session-id';
const SESSION_COOKIE_EXPIRATION_DURATION: number = 7 * 24 * 60 * 60 * 1000;

export async function HashPassword(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password.normalize(), salt, 64, (error: Error | null, hash: Buffer<ArrayBufferLike>) => {
            if (error) reject(error);

            resolve(hash.toString('hex').normalize());
        });
    });
}

export async function GenerateSalt(): Promise<string> {
    return crypto.randomBytes(16).toString('hex').normalize();
}

export async function GenerateSessionId(): Promise<string> {
    return crypto.randomBytes(512).toString('hex').normalize();
}

export async function SetCookie(sessionId: string): Promise<void> {
    (await cookies()).set(SESSION_COOKIE_KEY, sessionId, {
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        expires: Date.now() + SESSION_COOKIE_EXPIRATION_DURATION
    });
}

export async function GetUser(): Promise<UserProps | null> {
    const sessionId: string | undefined = (await cookies()).get(SESSION_COOKIE_KEY)?.value;

    if (sessionId !== undefined) {
        const users: UserProps[] = await GetAllUsers();

        for (let i: number = 0; i < users.length; i++) {
            if (users[i].session === sessionId) {
                return users[i];
            };
        }
        return null;
    }
    else return null;
}

export async function LogOut() {
    const sessionId: string | undefined = (await cookies()).get(SESSION_COOKIE_KEY)?.value;

    if (sessionId !== undefined) {
        (await cookies()).delete(SESSION_COOKIE_KEY);
    }
    redirect('/');
}