interface IDictionary {
    add(key: any, value: any): void;
    remove(key: any): void;
    containsKey(key: any): boolean;
    keys(): any[];
    values(): any[];
}