import { DataPoint } from "../types";
import { shuffle } from "./array";

export function crossValidate(opts: {
   features: DataPoint[][];
   labels: DataPoint[];
   folds: number;
   predict: (features: any[]) => DataPoint;
   fit: (features: any[][], labels: any[]) => void;
   positiveLabel: DataPoint;
}) {
   let foldSize = Math.floor(opts.features.length / opts.folds);
   let predictions: { output: DataPoint; expected: DataPoint }[] = [];

   if (opts.folds < 2) {
      throw new Error("Number of folds must be at least 2.");
   }

   // shuffle data to ensure randomness
   let indices = Array.from(Array(opts.features.length).keys());
   shuffle(indices);
   opts.features = indices.map((i) => opts.features[i]);
   opts.labels = indices.map((i) => opts.labels[i]);

   // test each fold
   for (let i = 0; i < opts.folds; i++) {
      let start = i * foldSize;
      let end = start + foldSize;

      // train
      let trainFeatures = opts.features
         .slice(0, start)
         .concat(opts.features.slice(end));
      let trainLabels = opts.labels
         .slice(0, start)
         .concat(opts.labels.slice(end));
      opts.fit(trainFeatures, trainLabels);

      // test
      let testFeatures = opts.features.slice(start, end);
      let testLabels = opts.labels.slice(start, end);

      for (let j = 0; j < testFeatures.length; j++) {
         let output = opts.predict(testFeatures[j]);
         let expected = testLabels[j];
         predictions.push({ output, expected });
      }
   }

   return evaluateMetrics(predictions, opts.positiveLabel);
}

export function evaluateMetrics(
   predictions: { output: DataPoint; expected: DataPoint }[],
   positiveLabel: DataPoint
) {
   let truePositives = 0;
   let trueNegatives = 0;
   let falsePositives = 0;
   let falseNegatives = 0;

   for (let { output, expected } of predictions) {
      if (output === positiveLabel && expected === positiveLabel) {
         truePositives++;
      } else if (output === positiveLabel && expected !== positiveLabel) {
         falsePositives++;
      } else if (output !== positiveLabel && expected === positiveLabel) {
         falseNegatives++;
      } else if (output !== positiveLabel && expected !== positiveLabel) {
         trueNegatives++;
      }
   }

   let accuracy = (truePositives + trueNegatives) / predictions.length || 0;
   let precision = truePositives / (truePositives + falsePositives) || 0;
   let recall = truePositives / (truePositives + falseNegatives) || 0;
   let f1Score = (2 * precision * recall) / (precision + recall) || 0;
   return {
      accuracy,
      precision,
      recall,
      f1Score,
   };
}
