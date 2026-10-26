import { z } from "zod";


export const createTransactionSchema = z.object({
    title: z.string().trim().min(1),
    amount: z.number().positive(),
    type: z.enum(['credit', 'debit'])
})

export const getTransactionParamsSchema = z.object({
    id: z.uuid()
})