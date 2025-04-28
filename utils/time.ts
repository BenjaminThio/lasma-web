export async function sleep(duration: number) {
    return new Promise((resolve: (value: unknown) => void) => {
        setTimeout(resolve, duration);
    });
}