import {IdDatabase} from './classes';

/*
@author Warre
*/

describe('IdDatabase Tests', () => {

    const idDatabase = new IdDatabase();

    test('Generating an ID.', () => {
        const id = idDatabase.generateId(8);
        expect(id.length).toEqual(8);
        for(const anID of id) {
            expect(idDatabase.stringChars).toContain(anID);
        }
    });

    test('Adding and removing IDs and their uniqueness.', () => {
        const id1 = 'aaaaaaaa';
        idDatabase.addScreen(id1);
        const id2 = idDatabase.generateId(8);
        void expect(idDatabase.addScreen(id1)).toBeFalse;
        void expect(idDatabase.addController(id1)).toBeFalse;
        void expect(idDatabase.addController(id2)).toBeTrue;
        void expect(idDatabase.addScreen(id2)).toBeFalse;
        void expect(idDatabase.removeScreen(id1)).toBeTrue;
        void expect(idDatabase.removeController(id2)).toBeTrue;
    });
});