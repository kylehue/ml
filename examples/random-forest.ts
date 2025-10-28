import { RandomForestClassifier } from "../src";
import { crossValidate } from "../src/utils/validation";
import iris from "../datasets/iris.json";

// // basic
// const tree = new RandomForestClassifier();
// tree.fit(
//    [
//       ["green", 3],
//       ["yellow", 3],
//       ["red", 1],
//       ["red", 1],
//       ["yellow", 3],
//    ],
//    ["apple", "apple", "grape", "grape", "lemon"]
// );

// console.log(tree, tree.predict(["red", 13]));

// larger dataset
const model = new RandomForestClassifier();
let irisFeatures = iris.map((item) => [
   item.sepalLength,
   item.sepalWidth,
   item.petalLength,
   item.petalWidth,
]);
let irisLabels = iris.map((item) => item.species);
console.log("Random Forest Metrics:");
console.table(
   crossValidate({
      features: irisFeatures,
      labels: irisLabels,
      fit(features, labels) {
         model.fit(features, labels);
      },
      predict(features) {
         return model.predict(features).label;
      },
      folds: 5,
      positiveLabel: "setosa",
   })
);
