import {IdDatabase} from './classes';

describe('IdDatabase Tests', () => {
    
    const idDatabase = new IdDatabase();

    test('Generating an ID.', () => {
        let id = idDatabase.generateId(8);
        expect(id.length).toEqual(8);
        for(let i = 0; i<id.length; i++){
            expect(idDatabase.stringChars).toContain(id[i]);
        }
    }); 

    test('Adding and removing IDs and their uniqueness.', () => {
        let id1 = "aaaaaaaa";
        idDatabase.addScreen(id1);
        let id2 = idDatabase.generateId(8);
        expect(idDatabase.addScreen(id1)).toBeFalse;
        expect(idDatabase.addController(id1)).toBeFalse;
        expect(idDatabase.addController(id2)).toBeTrue;
        expect(idDatabase.addScreen(id2)).toBeFalse;
        expect(idDatabase.removeScreen(id1)).toBeTrue;
        expect(idDatabase.removeController(id2)).toBeTrue;
    });
});