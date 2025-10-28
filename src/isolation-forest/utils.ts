export function cFactor(n: number): number {
   if (n > 2) {
      let harmonicNumber = Math.log(n - 1) + 0.5772156649;
      return 2 * harmonicNumber - (2 * (n - 1)) / n;
   }
   if (n === 2) {
      return 1;
   }
   return 0;
}
