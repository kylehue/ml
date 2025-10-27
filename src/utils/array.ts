export function createFrequencyMap(arr: any[]) {
   let freqMap = new Map();
   for (let item of arr) {
      freqMap.set(item, (freqMap.get(item) ?? 0) + 1);
   }
   return freqMap;
}

export function shuffle<T>(arr: T[]): T[] {
   for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
   }
   return arr;
}
