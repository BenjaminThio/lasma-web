export async function LoadImage(path: string): Promise<File> {
    const response: Response = await fetch(path);
    const blob: Blob = await response.blob();
    const splitPath: string[] = path.split('/');
    const imageName: string = splitPath.pop() as string;
    const file: File = new File([blob], imageName, {type: blob.type});

    return file;
}

export async function ImagePath2Base64(path: string): Promise<string> {
    return await Image2Base64(await LoadImage(path));
}

export async function Image2Base64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader: FileReader = new FileReader();

        fileReader.onload = () => {
            const result: string | ArrayBuffer | null = fileReader.result;

            if (typeof result === 'string') {
                //console.log(result);
                resolve(result);
            }
            else {
                reject('Fail to parse file to Base64.');
            }
        };

        fileReader.onerror = () => {
            reject('File reader error.');
        };

        fileReader.readAsDataURL(file);
    });
}

export async function Images2Base64s(files: FileList | null): Promise<string[]> {
    const base64s: Promise<string>[] = [];

    if (files !== null && files.length > 0) {
        for (let fileIndex: number = 0; fileIndex < files.length; fileIndex++) {
            base64s.push(Image2Base64(files.item(fileIndex) as File));
        }
    }

    return await Promise.all(base64s);
}

export async function IsValidImage(base64: string): Promise<boolean> {
    const image = new Image();

    return new Promise((resolve) => {
        image.onload = () => {resolve(true);};
        image.onerror = () => {resolve(false);};
        image.src = base64;
    });
}