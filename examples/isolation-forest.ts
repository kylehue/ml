import { IsolationForest } from "../src";
import { evaluateMetrics } from "../src/utils/validation";
import { random } from "../src/utils/math";

// generate random normal data
let normalFeatures = Array.from({ length: 150 }, () => [
   random(50, 55),
   random(30, 35),
   random(10, 15),
   random(5, 10),
]);

// generate random anomaly data
let anomalyFeatures = Array.from({ length: 150 }, () => [
   random(20, 25),
   random(80, 85),
   random(40, 45),
   random(65, 70),
]);

// train
const model = new IsolationForest();
model.fit(normalFeatures);

// test
let testFeatures = [...normalFeatures, ...anomalyFeatures];
let testLabels = [
   ...normalFeatures.map(() => 0),
   ...anomalyFeatures.map(() => 1),
];

let predictions = testFeatures.map((f) => {
   let score = model.predict(f);
   return {
      output: Math.round(score),
      expected: testLabels[testFeatures.indexOf(f)],
   };
});

console.log(model);

// evaluate
const metrics = evaluateMetrics(predictions, 1);
console.log("Isolation Forest Metrics:");
console.table(metrics);

// console.log(model.predict([52, 33, 14, 6])); // should be low
// console.log(model.predict([155, 4543, 1342, 1230])); // should be high
