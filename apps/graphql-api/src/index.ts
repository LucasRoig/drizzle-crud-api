import { buildSchema } from 'drizzle-graphql';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { closeDrizzleInstance, getDrizzleInstance } from './drizzle-connection';

async function main() {
    const db = getDrizzleInstance();
    const { schema } = buildSchema(db);
    const server = new ApolloServer({ schema });

    const { url } = await startStandaloneServer(server);
    console.log(`🚀 Server ready at ${url}`);
}


void main();
