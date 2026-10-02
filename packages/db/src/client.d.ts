import * as schema from './schema';
export declare const db: import('drizzle-orm/node-postgres').NodePgDatabase<typeof schema>;
export type DB = typeof db;
export declare function closePool(): Promise<void>;
//# sourceMappingURL=client.d.ts.map
