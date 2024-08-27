import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import {z} from "zod";
import { verifySchema } from "@/schemas/verify.schema";

// const verifyCodeSchema= z.object({
//     code: verifySchema
// })


export async function POST (request:Request) {
    await dbConnect()

    try {

        const {username, code} = await request.json();

        // const result = verifyCodeSchema.safeParse({code: code })

        // if(!result.success){
        //     const verifyCodeErrors = result.error.format().code?._errors || [];

        //     return Response.json(
        //         {
        //             success: false,
        //             message: verifyCodeErrors.length > 0  
        //            { ? verifyCodeErrors.join(', ')}
        //             : "Invalid Verification Code"
        //         },
        //         { 
        //             status:400 
        //         }
        //     )
        // }

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({  username: decodedUsername })

        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not Found"
                },
                { 
                    status:400 
                }
            )
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if ( isCodeValid && isCodeNotExpired){

            user.isVerified = true;
            await user.save();

            return Response.json(
                {
                    success: true,
                    message: "User Verified Successfully"
                },
                { 
                    status:200 
                }
            )
        } else if ( !isCodeNotExpired ){
            return Response.json(
                {
                    success: false,
                    message: "Verification Code Expired. Please sign up again to get a new code."
                },
                { 
                    status:400 
                }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "Invalid Verification Code"
                },
                { 
                    status:400 
                }
            )
        }

    } catch (error) {
        
        console.error("Error Verifying User", error)
        return Response.json(
            {
                success: false,
                message: "Error Verifying User"
            },
            { 
                status:500 
            }
        )
    }
}