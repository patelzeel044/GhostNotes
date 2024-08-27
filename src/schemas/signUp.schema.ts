import {z} from 'zod';

export const usernameValidation = z
.string()
.min(3, 'Username must be at least 3 characters')
.max(25, 'Username must be not more than 25 characters')
.regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters')

export const signUpSchema = z.object({
    username:usernameValidation,

    email: z.string().email({message:"Invalid email Address"}),

    password:z
    .string()
    .min(6,{message:"password must be at least 6 characters"})

})