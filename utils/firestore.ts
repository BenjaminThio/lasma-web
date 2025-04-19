import { getFirestore, setDoc, updateDoc, doc, collection, getDoc, getDocs, DocumentSnapshot, DocumentData, QuerySnapshot } from 'firebase/firestore';
import app from './firebaseConfig';

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

export interface InfoProps {
    name: string;
    description: string;
    category: Category;
    status: Status;
    thumbnail: string;
}
export interface AppProps {
    ownerUUID: string;
    isGlobal: boolean;
    info: InfoProps;
    leaderboard: Record<string, string>;
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
            thumbnail: props.info.thumbnail
        },
        leaderboard: props.leaderboard
    });
}

export async function UpdateApp(uuid: string, field: AppField, value: AppFieldValue): Promise<void> {
    await updateDoc(doc(db, 'apps', uuid), {
        [field]: value
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

export async function GetAllApps(): Promise<AppProps[]> {
    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(collection(db, 'apps'));
    const apps: AppProps[] = [];

    querySnapshot.forEach((app) => {
        apps.push(app.data() as AppProps);
    });

    return apps;
}

export default db;