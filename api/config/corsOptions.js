const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true); //(error, allowed: boolean)
    } else {
      callback(new Error("not allowed by CORS"));
    }
  },
  credentials: true, //Access-Control-Allow-Credentials
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
