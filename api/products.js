const products = require("../lib/products");

console.log("products", products);

module.exports = (req, res) => {
  res.json(products.map(({ price, ...safe }) => safe));
};
