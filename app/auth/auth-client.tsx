'use client';

import { GetAllUsers, UserProps } from "@/utils/firestore";
import { SetCookie } from "./auth";

export async function Login(email: string, password: string) {
    const users: UserProps[] = await GetAllUsers();

    for (let i: number = 0; i < users.length; i++) {
        if (email === users[i].info.email){
            if (password === users[i].info.password) {
                await SetCookie(users[i].session);
                window.location.href = '/';
            }
        };
    }
    console.log('Failed Login');
}