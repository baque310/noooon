
export function searchArray<T>(arr: any, searchTerm: any, searchAttrs: any): T[] {
    if (!searchTerm) return arr;
    const searchRegExp = new RegExp(searchTerm, "i");
    return arr.filter((item: any) => {
        if (searchAttrs.length > 0) {
            return searchAttrs.some((attr: any) => searchRegExp.test(item[attr]));
        }
        return searchRegExp.test(item) as T;
    });
}
