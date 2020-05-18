import { Update } from "../../src/core/Update";

const INITIAL_RECIPES = [
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
const google = {
  script: {
    run: {
      withSuccessHandler: (fn: any) => {
        successHandler = fn;
        return google.script.run;
      },
      withFailureHandler: (fn: any) => {
        failureHandler = fn;
        return google.script.run;
      },
      parseDocument: () => {
        successHandler(INITIAL_RECIPES);
      },
      updateDocument: (update: Update) => {
        console.log("UPDATE: " + JSON.stringify(update, undefined, 2));
      }
    }
  }
};

(frames[0].window as any).google = google;