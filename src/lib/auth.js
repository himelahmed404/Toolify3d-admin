import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins"; // 1. Import the plugin

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('toolify3d');

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client
  }),
  emailAndPassword: { 
    enabled: true,
    disableSignUp: true,
  },
  plugins: [
    admin() // 2. Add it to your plugins array
  ]
});