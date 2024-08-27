import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST (request:Request) {
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

    const userId= user._id

    const { acceptMessages } = await request.json();
        
    const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { isAcceptingMessages: acceptMessages },
        { new:true }
    )

    if(!updatedUser){
        return Response.json(
            {
                success:false,
                message:"Unable to find user to update message acceptance status"
            },
            {
                status:404  
            }
        )
    }

    return Response.json(
        {
            success:true,
            message:"Message acceptance status updated successfully",
            updatedUser,
        },
        {
            status:200
        }
    )
    


    } catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { 
                success: false, message: 'Error updating message acceptance status' 
            },
            { 
                status: 500 
            }
        );
    }
}


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
        
    const foundUser = await UserModel.findById(user._id)

    if(!foundUser){
        return Response.json(
            {
                success:false,
                message:"User not found"
            },
            {
                status:404  
            }
        )
    }

    return Response.json(
        {
            success:true,
            isAcceptingMessages: foundUser.isAcceptingMessages,
        },
        {
            status:200
        }
    )
    


    } catch (error) {

        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { 
                success: false, message: 'Error retrieving message acceptance status:' 
            },
            { 
                status: 500 
            }
        );
    }
}