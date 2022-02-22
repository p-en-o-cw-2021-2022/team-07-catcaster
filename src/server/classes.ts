/*
Classes used by the server.
*/
class StringRandomizer
{
   public stringChars:string = "0123456789abcdef";

   public GenerateUniqueHexString(length:number)
   {
      let result:string = "";
      for(let i = 0; i<length;i++) {
        let character:string = this.stringChars[i];
        result = result + character;
      }
      return result;
   }
}