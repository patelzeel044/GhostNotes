import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";



export async function DELETE (request:Request) {

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
        
        const foundUser = await UserModel.findByIdAndUpdate( user._id,
            {
                $set:{
                    messages:[]
                }
            },
            {
                new: true
            }
        )
        
        if(foundUser.messages.length !== 0){
            return Response.json(
                {
                    success:false,
                    message:"Failed to delete all messages"
                },
                {
                    status:40
                }
            )
        }
        
        return Response.json(
            {
                success:true,
                message:"All Messages Deleted Successfully"
            },
            {
                status:200
            }
        )
        
    } catch (error) {
        console.error("Error deleting all messages:",error);
        return Response.json(
            {
                success: false,
                message: 'Error deleting all messages',
            },
            { 
                status: 500 
            }
        );
        
    }
}