//import {StringRandomizer} from './classes';

describe('IDgenerator', () => {
    
    const idGenerator = new StringRandomizer();

    test('Testing the generation of a string of 8 hexadecimal characters', () => {
        const id = idGenerator.generateId(8);
        expect(id.length).toEqual(8);        
    
    })
})