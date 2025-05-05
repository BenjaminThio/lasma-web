import { getFirestore, setDoc, updateDoc, doc, collection, getDoc, getDocs, DocumentSnapshot, DocumentData, QuerySnapshot, deleteDoc } from 'firebase/firestore';
import app from './firebase-config';
import { GetUser } from '@/app/auth/auth';

const db = getFirestore(app);

export type InfoField = 'name' | 'description' | 'category' | 'status' | 'thumbnail';
export type AppField = 'ownerUUID' | 'isGlobal' | `info.${InfoField}` | 'leaderboard';
export type Category = string;
export type AppFieldValue = string | boolean | Record<string, string> | number;

export enum Status {
    Ready,
    UnderConstruction,
    Disabled
}

export enum Platforms {
    Windows,
    Linux,
    MacOs,
    Android
}

export interface InfoProps {
    name: string;
    description: string;
    category: Category;
    status: Status;
    thumbnail: string;
    platforms: PlatformsProps;
    tag: Tag;
}
export interface AppProps {
    ownerUUID: string;
    isGlobal: boolean;
    info: InfoProps;
    leaderboard: LeaderboardProps;
}

export interface PlatformsProps {
    windows: boolean;
    linux: boolean;
    macOs: boolean;
    android: boolean;
}

export enum Tag {
    Free,
    Paid,
    Web
}

export async function CreateNewApp(uuid: string, props: AppProps): Promise<void> {
    await setDoc(doc(db, 'apps', uuid), {
        ownerUUID: props.ownerUUID,
        isGlobal: props.isGlobal,
        info: {
            name: props.info.name,
            description: props.info.description,
            status: props.info.status,
            category: props.info.category,
            thumbnail: props.info.thumbnail,
            tag: props.info.tag,
            platforms: {
                windows: props.info.platforms.windows,
                linux: props.info.platforms.linux,
                macOs: props.info.platforms.macOs,
                android: props.info.platforms.android
            }
        },
        leaderboard: props.leaderboard
    });
}

export async function UpdateApp(uuid: string, field: AppField, value: AppFieldValue): Promise<void> {
    await updateDoc(doc(db, 'apps', uuid), {
        [field]: value
    });
}

export async function MergeUpdateApp(uuid: string, name: string, description: string, status: Status, thumbnail: string, tag: Tag, platforms: PlatformsProps) {
    await setDoc(doc(db, 'apps', uuid), {
        info: {
            name: name,
            description: description,
            status: status,
            thumbnail: thumbnail,
            tag: tag,
            platforms: {
                windows: platforms.windows,
                linux: platforms.linux,
                macOs: platforms.macOs,
                android: platforms.android
            }
        },
    });
}

export async function GetApp(uuid: string): Promise<AppProps | null> {
    const documentSnapshot: DocumentSnapshot<DocumentData, DocumentData> = await getDoc(doc(db, 'apps', uuid));

    if (documentSnapshot.exists()) {
        return documentSnapshot.data() as AppProps;
    } else {
        return null;
    }
}

export async function GetAllAppsIDPropsPairs(): Promise<Record<string, AppProps>> {
    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(collection(db, 'apps'));
    const apps: Record<string, AppProps> = {};

    querySnapshot.forEach((app) => {
        apps[app.id] = app.data() as AppProps;
    });

    return apps;
}

export async function GetAllApps(): Promise<AppProps[]> {
    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(collection(db, 'apps'));
    const apps: AppProps[] = [];

    querySnapshot.forEach((app) => {
        apps.push(app.data() as AppProps);
    });

    return apps;
}

export interface UserProps {
    info: UserInfoProps,
    apps: string[],
    session: string
}

export interface UserInfoProps {
    username: string,
    password: string,
    salt: string,
    email: string
}

export type Email = `${string}@${string}.com`;

export async function UpdateUser(email: string, field: string, value: string | string[]): Promise<void> {
    await updateDoc(doc(db, 'users', email), {
        [field]: value
    });
}

export async function AddNewUser(email: Email, session: string, {username, password, salt}: UserInfoProps) {
    await setDoc(doc(db, 'users', email), {
        session: session, 
        info : {
            username: username,
            password: password,
            salt: salt,
            email: email
        },
        apps: []
    } as UserProps, {merge: false});
}

export async function GetAllUsers(): Promise<UserProps[]> {
    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(collection(db, 'users'));
    const users: UserProps[] = [];

    querySnapshot.forEach((user) => {
        users.push(user.data() as UserProps);
    });

    return users;
}

export interface PlayerProps {
    name: string,
    score: number,
    datetime: string
}

export interface LeaderboardProps {
    [id: string]: PlayerProps;
}

export async function AddNewPlayer(uuid: string, playerConfig: PlayerProps) {
    await updateDoc(doc(db, 'apps', uuid), {
        [`leaderboard.${crypto.randomUUID()}`]: playerConfig
    });
}

export async function UpdatePlayer(uuid: string, playerProp: string, playerConfig: PlayerProps) {
    await updateDoc(doc(db, 'apps', uuid), {
        [`leaderboard.${playerProp}`]: playerConfig
    });
}

export async function DeleteApp(uuid: string) {
    const user: UserProps | null = await GetUser();

    if (user !== null) {
        const apps = user.apps;

        await UpdateUser(user.info.email, 'apps', apps.filter(appId => appId !== uuid));
        await deleteDoc(doc(db, 'apps', uuid));
    }
}

export default db;