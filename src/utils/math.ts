export function random(min: number, max: number): number {
   return Math.random() * (max - min) + min;
}

export function mean(arr: number[]) {
   return arr.reduce((a, b) => a + b, 0) / arr.length;
}
