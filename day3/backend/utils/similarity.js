const dotProduct = (a, b) => {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
};

const magnitude = (a) => {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
};

const cosineSimilarity = (a, b) => {
  return dotProduct(a, b) / (magnitude(a) * magnitude(b));
};

module.exports = { dotProduct, cosineSimilarity };
