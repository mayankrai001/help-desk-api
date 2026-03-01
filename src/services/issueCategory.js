const Category = require("../models/issueCategory.js");

const getCategoriesService = async () => {
  const categories = await Category.find();
  console.log("++++ categories +++++", categories);

  return categories;
};

module.exports = {
  getCategoriesService,
};
