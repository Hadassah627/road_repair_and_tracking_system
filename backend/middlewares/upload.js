// Simple middleware that passes through without multer
// This is a placeholder until multer is installed
const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      // Just pass through for now
      next();
    };
  }
};

module.exports = upload;
