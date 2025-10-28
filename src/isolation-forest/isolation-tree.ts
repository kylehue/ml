import { random } from "../utils/math";
import { cFactor } from "./utils";

export interface IsolationTreeOptions {
   maxDepth?: number;
}

export class IsolationTree {
   public features: number[][] = [];
   public left: IsolationTree | null = null;
   public right: IsolationTree | null = null;
   public questionIndex: number | null = null;
   public questionValue: number | null = null;
   private _options: Required<IsolationTreeOptions> = {
      maxDepth: Infinity,
   };
   private _depth: number = 1;
   private _defaultMaxDepth: number = Infinity;

   constructor(options: IsolationTreeOptions = {}) {
      this._options = { ...this._options, ...options };
   }

   pathLength(features: number[]): number {
      if (
         this.left === null ||
         this.right === null ||
         this.features.length <= 1 ||
         this._depth >= Math.min(this._options.maxDepth, this._defaultMaxDepth)
      ) {
         return this._depth + cFactor(this.features.length);
      }

      // impossible to happen unless the tree is not built properly
      if (this.questionIndex === null || this.questionValue === null) {
         throw new Error("Invalid tree node.");
      }

      if (features[this.questionIndex] <= this.questionValue) {
         return this.left!.pathLength(features);
      } else {
         return this.right!.pathLength(features);
      }
   }

   fit(features: number[][]) {
      this.features = features;
      this._defaultMaxDepth = Math.ceil(Math.log2(features.length));

      let nodes: IsolationTree[] = [this];
      while (nodes.length > 0) {
         let node = nodes.pop()!;
         node._split();
         if (node.left) nodes.push(node.left);
         if (node.right) nodes.push(node.right);
      }
   }

   private _split() {
      if (
         this._depth >= Math.min(this._options.maxDepth, this._defaultMaxDepth)
      ) {
         return;
      }

      if (this.features.length <= 2) return;

      // pick a random feature
      let featureIndex = Math.floor(random(0, this.features[0].length));

      // find min and max values for that feature
      let featureValues = this.features.map((f) => f[featureIndex]);
      let minValue = Math.min(...featureValues);
      let maxValue = Math.max(...featureValues);

      // pick a random split value between min and max
      let splitValue = random(minValue, maxValue);

      // split
      let leftFeatures: number[][] = [];
      let rightFeatures: number[][] = [];
      for (let feature of this.features) {
         if (feature[featureIndex] <= splitValue) {
            leftFeatures.push(feature);
         } else {
            rightFeatures.push(feature);
         }
      }

      // no division happened so skip this question
      if (leftFeatures.length === 0 || rightFeatures.length === 0) {
         return;
      }

      this.left = new IsolationTree(this._options);
      this.left._depth = this._depth + 1;
      this.left.features = leftFeatures;
      this.left._defaultMaxDepth = this._defaultMaxDepth;
      this.right = new IsolationTree(this._options);
      this.right._depth = this._depth + 1;
      this.right.features = rightFeatures;
      this.right._defaultMaxDepth = this._defaultMaxDepth;
      this.questionIndex = featureIndex;
      this.questionValue = splitValue;
   }
}
