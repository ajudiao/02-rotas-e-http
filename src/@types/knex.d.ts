import { Knex } from "knex";
import { number } from "zod";

declare module 'knex/types/tables.js' {
    export interface Tables {
        transactions: {
            id: string,
            title: string,
            amount: number,
            session_id?: string
        }
    }
}