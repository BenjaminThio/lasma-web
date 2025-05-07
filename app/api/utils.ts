import { IsValidImage } from "@/utils/image";

interface PlainAppProps {
    name: string | null;
    description: string | null;
    isGlobal: string | null;
    status: string | null;
    tag: string | null;
    thumbnail: string | null;
    windows: string | null;
    linux: string | null;
    macOs: string | null;
    android: string | null;
}

export async function StrictCheck({name, description, isGlobal, status, tag, thumbnail, windows, linux, macOs, android}: PlainAppProps) {
    function booleanCheck(name: string, value: string | null) {
        if (value === null) errorMessages.push(`The \`${name}\` argument is not provided.`);
        else if (['true', 'false'].includes(value.toLowerCase())) errorMessages.push(`The \`${name}\` argument must be a boolean — only true or false is accepted.`);
    }

    const errorMessages: string[] = ['Error Reports:'];
    // Name
    if (name === null) errorMessages.push('The `name` argument is not provided.');
    else if (name.length === 0 || name.length > 20) errorMessages.push('The `name` must be at least `1` characters and no more than `20` characters.');

    // Description
    if (description === null) errorMessages.push('The `description` argument is not provided.');
    else if (description.length === 0 || description.length > 60) errorMessages.push('The `description` must be at least `1` characters and no more than `60` characters.');;

    // Is global
    booleanCheck('isGlobal', isGlobal);

    // Status
    if (status === null) errorMessages.push('The `status` argument is not provided.');
    else if (parseInt(status) < 0 || parseInt(status) > 2) errorMessages.push('The `status` argument must be a valid status enum:\n0: Ready\n1: Under Construction\n2: Disabled');

    // Status
    if (tag === null) errorMessages.push('The `tag` argument is not provided.');
    else if (parseInt(tag) < 0 || parseInt(tag) > 2) errorMessages.push('The `tag` argument must be a valid tag enum:\n0: Free\n1: Paid\n2: Web');

    // Thumbnail
    if (thumbnail !== null && !await IsValidImage(thumbnail)) errorMessages.push('The provided Base64 string is not a valid image.');

    booleanCheck('windows', windows);
    booleanCheck('linux', linux);
    booleanCheck('macOs', macOs);
    booleanCheck('android', android);

    return errorMessages;
}