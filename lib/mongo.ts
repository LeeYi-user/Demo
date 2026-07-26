// `vite.config.ts` rewrites this specifier to the `npm:` form and marks it
// external — see the comment there for why it must not be bundled.
import {
  type Db,
  GridFSBucket,
  type GridFSFile,
  MongoClient,
  ObjectId,
  ServerApiVersion,
} from "mongodb";

const DB_NAME = "demo";

let connecting: Promise<MongoClient> | null = null;

/**
 * Connect lazily and reuse the client for the lifetime of the isolate.
 *
 * Connecting at module scope would run during `vite build` and would abort the
 * whole isolate on a cold start if Atlas is briefly unreachable. Deferring it
 * to the first query keeps the driver's own pool doing the pooling, which is
 * what it is built for — so the client is never closed.
 */
export function getClient(): Promise<MongoClient> {
  if (connecting === null) {
    const uri = Deno.env.get("MONGODB_CONNECTION_URI");

    if (!uri) {
      return Promise.reject(
        new Error("MONGODB_CONNECTION_URI is not set"),
      );
    }

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    // Let the next request retry instead of caching a rejected promise.
    connecting = client.connect().catch((error) => {
      connecting = null;
      throw error;
    });
  }

  return connecting;
}

export async function getDb(): Promise<Db> {
  return (await getClient()).db(DB_NAME);
}

export async function getBucket(): Promise<GridFSBucket> {
  return new GridFSBucket(await getDb());
}

// Re-exported so the driver version is pinned in exactly one place.
export { ObjectId };
export type { GridFSFile };
