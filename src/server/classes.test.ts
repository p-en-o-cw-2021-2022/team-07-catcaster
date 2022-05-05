import {IdDatabase} from './classes';

/*
@author Warre
*/

describe('IdDatabase Tests', () => {

    const idDatabase = new IdDatabase();

    test('Generating an ID.', () => {
        const id = idDatabase.generateId(8);
        expect(id.length).toEqual(8);
        for(let i = 0; i<id.length; i++) {
            expect(idDatabase.stringChars).toContain(id[i]);
        }
    });

    test('Adding and removing IDs and their uniqueness.', () => {
        const id1 = 'aaaaaaaa';
        idDatabase.addScreen(id1);
        const id2 = idDatabase.generateId(8);
        expect(idDatabase.addScreen(id1)).toBeFalse;
        expect(idDatabase.addController(id1)).toBeFalse;
        expect(idDatabase.addController(id2)).toBeTrue;
        expect(idDatabase.addScreen(id2)).toBeFalse;
        expect(idDatabase.removeID(id1)).toBeTrue;
        expect(idDatabase.removeID(id2)).toBeTrue;
    });
});