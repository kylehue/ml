import { DataPoint } from "../types";
import { createFrequencyMap } from "../utils/array";

// check if feature matches a question
export function matches(question: DataPoint, feature: DataPoint) {
   if (typeof question === "number" && typeof feature === "number") {
      return feature <= question;
   } else {
      return feature == question;
   }
}

// 1 - sum(p(i)^2)
export function gini(labels: DataPoint[]) {
   let countMap = createFrequencyMap(labels);

   let impurity = 1;
   for (let [_, count] of countMap) {
      let prob = count / labels.length;
      impurity -= prob * prob;
   }

   return impurity;
}
