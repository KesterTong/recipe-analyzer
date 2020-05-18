import { Update } from "../../src/core/Update";

let recipes = [
  {
    totalNutrientValues: ["1000", "200"],
    ingredients: [
      {
        unit: "cup",
        amount: "1",
        ingredient: {
          description: "flour",
          url:
            "https://fdc.nal.usda.gov/fdc-app.html#/food-details/169761/nutrients",
        },
        nutrientValues: ["100", "20"],
      },
      {
        unit: "g",
        amount: "100",
        ingredient: { description: "water", url: null },
        nutrientValues: ["b", "c"],
      },
    ],
    nutrientNames: ["Protein", "Calories"],
    title: "Recipe 1",
    url: "#heading=h.y3h0qes0821d",
  },
  {
    totalNutrientValues: ["1000", "200"],
    ingredients: [
      {
        unit: "cup",
        amount: "1",
        ingredient: { description: "flour", url: "#test" },
        nutrientValues: ["100", "20"],
      },
      {
        unit: "",
        amount: "2",
        ingredient: { description: "test2", url: "#bc" },
        nutrientValues: ["b", "c"],
      },
    ],
    nutrientNames: ["Protein", "Calories"],
    title: "Recipe 2",
    url: "#heading=h.abcd1234",
  },
];

let successHandler: any = undefined;
let failureHandler: any = undefined;
const google: any = {};
google.script = {};
google.script.run = {};
google.script.run.withSuccessHandler = (fn: any) => {
  successHandler = fn;
  return google.script.run;
};
google.script.run.withFailureHandler = (fn: any) => {
  failureHandler = fn;
  return google.script.run;
};
google.script.run.parseDocument = () => {
  successHandler(recipes);
};
google.script.run.updateDocument = (update: Update) => {
  successHandler();
  console.log("UPDATE: " + JSON.stringify(update, undefined, 2));
};

(frames[0].window as any).google = google;