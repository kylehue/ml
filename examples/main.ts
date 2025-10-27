import { RandomForestClassifier } from "../src";
import iris from "../datasets/iris.json";

// basic
const tree = new RandomForestClassifier();
tree.fit(
   [
      ["green", 3],
      ["yellow", 3],
      ["red", 1],
      ["red", 1],
      ["yellow", 3],
   ],
   ["apple", "apple", "grape", "grape", "lemon"]
);

console.log(tree, tree.predict(["red", 13]));

// larger dataset
const largeTree = new RandomForestClassifier();
let irisFeatures = iris.map((item) => [
   item.sepalLength,
   item.sepalWidth,
   item.petalLength,
   item.petalWidth,
]);
let irisLabels = iris.map((item) => item.species);
largeTree.fit(irisFeatures, irisLabels);

console.log(largeTree, largeTree.predict([5.1, 3.5, 1.4, 0.2]));
