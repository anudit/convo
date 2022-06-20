const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const options = {
   useUnifiedTopology: true
};
let client;
let mongoClientPromise;
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (hot module replacement).
   if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
}
   mongoClientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  mongoClientPromise = client.connect()
  }
  // Export a module-scoped MongoClient promise. By doing this in a
  // separate module, the client can be shared across functions.
module.exports = mongoClientPromise;
