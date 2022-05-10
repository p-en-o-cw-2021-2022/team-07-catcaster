/*
Classes used by the server.
@Author Warre.
*/

/*
This class stores all ID's and helps to check if they are unique.
*/
export class IdDatabase {
    public ids: Map<string, string>;

    public stringChars:string = '0123456789abcdef';

    public constructor() {
        this.ids = new Map();
        this.ids.set('','default');
    }

    public generateId(length:number) {
        let result:string = '';
        while(this.doesIdExist(result)) {
            for(let i = 0; i<length;i++) {
                const index = this.getRandomInt(this.stringChars.length);
                const character:string = this.stringChars[index];
                result = result + character;
            }
        }
        return result;
    }

    public doesIdExist(id:string) {
        if(this.ids.has(id)) {
            return true;
        } else {
            return false;
        }
    }

    public addScreen(id:string) {
        if(this.doesIdExist(id)) {
            return false;
        }

        this.ids.set(id,'screen');
        return true;
    }

    public addController(id:string) {
        if(this.doesIdExist(id)) {
            return false;
        }

        this.ids.set(id,'controller');
        return true;
    }

    public removeScreen(id:string) {
        if(!this.doesIdExist(id)) {
            return false;
        }

        this.ids.delete(id);
        return true;
    }

    public removeController(id:string) {
        if(!this.doesIdExist(id)) {
            return false;
        }

        this.ids.delete(id);
        return true;
    }

    public getScreenIds() {
        const list = [];
        for (const [key, value] of this.ids.entries()) {
            if (value === 'screen') {
                list.push(key);
            }
        }
        return list;
    }

    public getControllerIds() {
        const list = [];
        for (const [key, value] of this.ids.entries()) {
            if (value === 'controller') {
                list.push(key);
            }
        }
        return list;
    }


    //This function creates a random integer between 0 and the given maximum.
    private getRandomInt(max : number) {
        return Math.floor(Math.random()*max);
    }
}
