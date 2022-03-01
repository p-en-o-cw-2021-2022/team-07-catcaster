/*
Classes used by the server.
Written by Warre.
*/

/*
This class stores all ID's and helps to check if they are unique.
*/
export class IdDatabase
{
    public ids:any;

    public stringChars:string = "0123456789abcdef";

    public constructor() {
        this.ids = new Map();
        this.ids.set("","default");
    }

    public generateId(length:number)
    {
        let result:string = "";
        while(this.doesIdExist(result)){
            for(let i = 0; i<length;i++) {
                let index = this.getRandomInt(this.stringChars.length);
                let character:string = this.stringChars[index];
                result = result + character;
            }
        }
        return result;
    }

    public doesIdExist(id:string) {
        if(this.ids.has(id)) {
            return true;
        }
        else {
            return false;
        }
    }

    public addScreen(id:string) {
        if(this.doesIdExist(id)) {
            return false;
        }

        this.ids.set(id,"screen");
        return true;
    }

    public addController(id:string) {
        if(this.doesIdExist(id)) {
            return false;
        }

        this.ids.set(id,"controller");
        return;
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

    //This function creates a random integer between 0 and the given maximum.
    private getRandomInt(max : number) {
        return Math.floor(Math.random()*max);
}
}