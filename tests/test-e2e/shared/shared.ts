export function wait(milliseconds: number): Promise<any> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}