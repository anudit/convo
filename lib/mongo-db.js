import { MongoClient } from 'mongodb';

const databaseUrl = process.env.MONGODB_URI as string;
const options = {
   useUnifiedTopology: true
};

let client;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Atlas database URL to .env or .env.local');
}

const connectToMongo = () => {
  if (!global._connection) {
    client = new MongoClient(databaseUrl, options);
    global._connection = client.connect();
  }

  return global._connection;
};

export default connectToMongo;
