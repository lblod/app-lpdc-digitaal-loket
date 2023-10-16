

export async function processPromisesBatch<Type, ReturnType>(items: Array<Type>, limit: number, fn: (item: Type) => Promise<ReturnType>): Promise<ReturnType[]> {
    let results: ReturnType[] = [];
    for (let start = 0; start < items.length; start += limit) {
        const end = start + limit > items.length ? items.length : start + limit;

        const slicedResults = await Promise.all(items.slice(start, end).map(fn));

        results = [
            ...results,
            ...slicedResults,
        ]
    }
    return results;
}