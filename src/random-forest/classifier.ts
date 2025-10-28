import { DecisionTree } from "./decision-tree";

export interface RandomForestClassifierOptions {
   nEstimators?: number;
   maxDepth?: number;
   minSamplesSplit?: number;
}

export class RandomForestClassifier {
   private _options: Required<RandomForestClassifierOptions> = {
      nEstimators: 100,
      maxDepth: 10,
      minSamplesSplit: 2,
   };
   private _trees: DecisionTree[] = [];
   constructor(options: RandomForestClassifierOptions = {}) {
      this._options = { ...this._options, ...options };
   }

   fit(features: any[][], labels: any[]) {
      for (let i = 0; i < this._options.nEstimators; i++) {
         // bootstrap sampling
         let bootstrapFeatures: any[][] = [];
         let bootstrapLabels: any[] = [];
         for (let j = 0; j < features.length; j++) {
            let index = Math.floor(Math.random() * features.length);
            bootstrapFeatures.push(features[index]);
            bootstrapLabels.push(labels[index]);
         }

         // create decision tree from bootstrap sample
         let featureBaggingSize = Math.sqrt(features[0].length);
         let tree = new DecisionTree({
            maxDepth: this._options.maxDepth,
            minSamplesSplit: this._options.minSamplesSplit,
            maxFeatures: Math.floor(featureBaggingSize),
         });
         tree.fit(bootstrapFeatures, bootstrapLabels);
         this._trees.push(tree);
      }
   }

   predict(features: any[]) {
      let votes: Map<any, number> = new Map();
      for (let tree of this._trees) {
         let prediction = tree.predict(features);
         votes.set(prediction.label, (votes.get(prediction.label) ?? 0) + 1);
      }

      let bestLabel = null;
      let bestCount = -1;
      for (let [label, count] of votes) {
         if (count > bestCount) {
            bestCount = count;
            bestLabel = label;
         }
      }

      return {
         label: bestLabel,
         confidence: bestCount / this._trees.length,
      };
   }
}
