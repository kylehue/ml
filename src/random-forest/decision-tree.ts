import { DataPoint } from "../types";
import { createFrequencyMap, shuffle } from "../utils/array";
import { matches, gini } from "./utils";

export interface DecisionTreeOptions {
   maxDepth?: number;
   minSamplesSplit?: number;
   maxFeatures?: number;
}

export class DecisionTree {
   public features: DataPoint[][] = [];
   public labels: DataPoint[] = [];
   public left: DecisionTree | null = null;
   public right: DecisionTree | null = null;
   public questionIndex: number | null = null;
   public questionValue: DataPoint | null = null;
   private _options: Required<DecisionTreeOptions> = {
      maxDepth: 10,
      minSamplesSplit: 2,
      maxFeatures: Infinity,
   };
   private _depth: number = 1;

   constructor(options: DecisionTreeOptions = {}) {
      this._options = { ...this._options, ...options };
   }

   predict(feature: DataPoint[]): { label: DataPoint; confidence: number } {
      if (this.left === null && this.right === null) {
         // return the most common label
         let countMap = createFrequencyMap(this.labels);
         let bestLabel = null;
         let bestCount = -1;
         for (let [label, count] of countMap) {
            if (count > bestCount) {
               bestCount = count;
               bestLabel = label;
            }
         }

         return {
            label: bestLabel,
            confidence: bestCount / this.labels.length,
         };
      }

      // impossible to happen unless the tree is not built properly
      if (this.questionIndex === null || this.questionValue === null) {
         throw new Error("Invalid tree node.");
      }

      if (matches(this.questionValue, feature[this.questionIndex])) {
         return this.left!.predict(feature);
      } else {
         return this.right!.predict(feature);
      }
   }

   fit(features: DataPoint[][], labels: DataPoint[]) {
      this.features = features;
      this.labels = labels;
      let nodes: DecisionTree[] = [this];
      while (nodes.length > 0) {
         let node = nodes.pop()!;
         node._split();
         if (node.left) nodes.push(node.left);
         if (node.right) nodes.push(node.right);
      }
   }

   private _split() {
      if (new Set(this.labels).size <= 1) return;
      if (this.features.length < this._options.minSamplesSplit) return;
      if (this._depth >= this._options.maxDepth) return;

      let bestGini = gini(this.labels);
      let bestQuestionIndex = -1;
      let bestQuestionValue: DataPoint | null = null;
      let bestLeftFeatures: DataPoint[][] = [];
      let bestLeftLabels: DataPoint[] = [];
      let bestRightFeatures: DataPoint[][] = [];
      let bestRightLabels: DataPoint[] = [];

      // feature bagging
      let allFeatureIndices = shuffle([
         ...new Array(this.features[0].length).keys(),
      ]);
      let selectedFeatureIndices = allFeatureIndices.slice(
         0,
         Math.min(this._options.maxFeatures, allFeatureIndices.length)
      );

      // get all possible questions
      let questions: Array<Set<DataPoint>> = new Array(this.features[0].length)
         .fill(0)
         .map(() => new Set());
      for (let i = 0; i < this.features.length; i++) {
         for (let j = 0; j < this.features[i].length; j++) {
            questions[j].add(this.features[i][j]);
         }
      }

      // evaluate each question
      for (let qi of selectedFeatureIndices) {
         for (let q of questions[qi]) {
            // partition the data based on current question `q`
            let leftFeatures = [];
            let leftLabels = [];
            let rightFeatures = [];
            let rightLabels = [];
            for (let i = 0; i < this.features.length; i++) {
               if (matches(q, this.features[i][qi])) {
                  leftFeatures.push(this.features[i]);
                  leftLabels.push(this.labels[i]);
               } else {
                  rightFeatures.push(this.features[i]);
                  rightLabels.push(this.labels[i]);
               }
            }

            // no division happened so skip this question
            if (leftLabels.length === 0 || rightLabels.length === 0) continue;

            let leftGini = gini(leftLabels);
            let rightGini = gini(rightLabels);
            let leftWeight = leftLabels.length / this.labels.length;
            let rightWeight = rightLabels.length / this.labels.length;
            let weightedGini = leftWeight * leftGini + rightWeight * rightGini;
            if (weightedGini < bestGini) {
               bestGini = weightedGini;
               bestQuestionIndex = qi;
               bestQuestionValue = q;
               bestLeftFeatures = leftFeatures;
               bestLeftLabels = leftLabels;
               bestRightFeatures = rightFeatures;
               bestRightLabels = rightLabels;
            }
         }
      }

      // if the best gini is not improved, return null
      if (bestQuestionIndex === -1) {
         return;
      }

      this.left = new DecisionTree(this._options);
      this.left.features = bestLeftFeatures;
      this.left.labels = bestLeftLabels;
      this.left._depth = this._depth + 1;
      this.right = new DecisionTree(this._options);
      this.right.features = bestRightFeatures;
      this.right.labels = bestRightLabels;
      this.right._depth = this._depth + 1;
      this.questionIndex = bestQuestionIndex;
      this.questionValue = bestQuestionValue;
   }
}
