class Dictionary implements IDictionary {
    private _keys = new Array<any>();
    private _values = new Array<any>();

    constructor(init: { key: any; value: any; }[]) {
        for (let x = 0; x < init.length; x++) {
            this[init[x].key] = init[x].value;
            this._keys.push(init[x].key);
            this._values.push(init[x].value);
        }
    }

    public add(key: any, value: any) {
        this[key] = value;
        this._keys.push(key);
        this._values.push(value);
    }

    public remove(key: any) {
        const index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);

        delete this[key];
    }

    public keys(): any[] {
        return this._keys;
    }

    public values(): any[] {
        return this._values;
    }

    public containsKey(key: any) {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    public toLookup(): IDictionary {
        return this;
    }
}