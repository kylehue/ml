import { mean } from "../utils/math";
import { IsolationTree } from "./isolation-tree";
import { cFactor } from "./utils";

export interface IsolationForestOptions {
   nEstimators?: number;
   maxDepth?: number;
   subsampleSize?: number;
}

export class IsolationForest {
   private _trees: IsolationTree[] = [];
   private _options: Required<IsolationForestOptions> = {
      nEstimators: 100,
      maxDepth: Infinity,
      subsampleSize: 256,
   };
   private _subsampleSize: number = 256;

   constructor(options: IsolationForestOptions = {}) {
      this._options = { ...this._options, ...options };
   }

   fit(features: number[][]) {
      this._trees = [];
      this._subsampleSize = Math.min(
         this._options.subsampleSize,
         features.length
      );

      for (let i = 0; i < this._options.nEstimators; i++) {
         // bootstrap sampling
         let subsampleFeatures: number[][] = [];
         for (let j = 0; j < this._subsampleSize; j++) {
            let index = Math.floor(Math.random() * features.length);
            subsampleFeatures.push(features[index]);
         }

         let tree = new IsolationTree({
            maxDepth: this._options.maxDepth,
         });
         tree.fit(subsampleFeatures);
         this._trees.push(tree);
      }
   }

   predict(features: number[]): number {
      let pathLengths = this._trees.map((tree) => tree.pathLength(features));
      let avgPathLengths = mean(pathLengths);

      let score = 2 ** -(avgPathLengths / cFactor(this._subsampleSize));
      return score;
   }
}
