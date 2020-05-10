# Recipe Analyzer

This repository contains a typescript library for computing nutritional data
for recipes contained in a Google Doc.  It contains Google Apps Script code
(written in TypeScript) as well as code for analyzing nutritional data that is
not specific to Apps Script .

This is not an officially supported Google product

## High Level Design

(not yet implemented)

This code defines a Add-on for Google Docs, which
 * Parses recipes defined in a Google Docs document
 * Computes nutrients for these recipes
 * Provides a UI to easily edit recipes

This design allows the benefits of keeping all data in a Google
doc, while extending the doc by allowing automatic computation of nutritional
information, and also providing a UI that simplifies editing of recipes.

## Implementation

The code has the following components
 * Apps Script code to parser recipes from the Google Doc and update it.
 * A TypeScript wrapper around this (run in client-side UI code) that keeps
   a local copy of the parsed recipe data, and keeps this in sync with the Google
   doc.
 * TypeScript client-side code that provides a GUI for editing the recipes and
   computing nutrient values.