import { MongoClient, ServerApiVersion, Collection, Document } from "mongodb";

const collections = {
  services: "services",
  bookings: "bookings",
  users: "users",
  blogs: "blogs",
  videos: "videos",
  shops: "shops",
};

// Global variable to store the client
let client: MongoClient;
let clientPromise: Promise<MongoClient> | undefined;

const uri = process.env.NEXT_PUBLIC_MONGODB_URI || process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME || process.env.MONGODB_DB_NAME || "thecaredition";

// Don't throw errors during build time
if (process.env.NODE_ENV !== 'production' && !uri) {
  console.warn("MongoDB URI is not defined in environment variables");
}
if (process.env.NODE_ENV !== 'production' && !dbName) {
  console.warn("MongoDB name is not defined, using default");
}

// Extend the global object to include _mongoClientPromise
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise && uri) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function dbConnect<T extends Document = Document>(collectionName: string): Promise<any> {
  // TODO: Re-enable after deployment - temporarily return mock collection
  return {
    findOne: () => Promise.resolve(null),
    find: () => ({ toArray: () => Promise.resolve([]), sort: () => ({ toArray: () => Promise.resolve([]) }) }),
    insertOne: () => Promise.resolve({ insertedId: "mock-id", acknowledged: true }),
    updateOne: () => Promise.resolve({ modifiedCount: 1 }),
    deleteOne: () => Promise.resolve({ deletedCount: 1 }),
    countDocuments: () => Promise.resolve(0)
  };
  
  // if (!clientPromise) {
  //   throw new Error("Database connection not initialized");
  // }
  // const client = await clientPromise;
  // return client.db(dbName).collection<T>(collectionName);
}

export { dbConnect, collections };
