import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";


export async function GET (request:Request) {
    await dbConnect()

    try {
        const session = await getServerSession(authOptions);
        const user: User = session?.user;
    
        if(!session || !session.user){
            return Response.json(
                {
                    success:false,
                    message:"not Authenticated"
                },
                {
                    status:400
                }
            )
        }
    
        const userId = new mongoose.Types.ObjectId(user._id)

        const foundUser = await UserModel.aggregate([
            
            {
                $match:{
                    _id : userId
                }
            },
            {
                $unwind:"$messages"
            },
            {
                $sort:{
                    "messages.createdAt" : -1
                }
            },
            {
                $group:{
                    _id:"$_id",
                    messages:{
                        $push:"$messages"
                    }
                }
            }
        ])

        if(!foundUser || foundUser.length === 0){
            return Response.json(
                {
                    success:false,
                    message:"User not Found"
                },
                {
                    status:404
                }
            )
        }

        return Response.json(
            {
                success:true,
                messages: foundUser[0]?.messages,
                message:"Messages Fetched Successfully"
            },
            {
                status:200
            }
        )
    
        
    } catch (error) {
        console.error("Internal server error.  unexpected Error",error);
        return Response.json(
            {
                success: false,
                message: "Failed to fetch messages from user.  Internal server error",
            },
            { 
                status: 500 
            }
        );
        
    }

}