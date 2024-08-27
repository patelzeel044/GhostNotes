import UserModel from "@/model/user.model";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";



export async function DELETE (request:Request, {params}:{params: { messageid: string }}) {

    await dbConnect()

    const messageId = params.messageid;

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
    
        const updateResult = await UserModel.updateOne(
            {_id:user._id},
            {
                $pull:{
                    messages:{
                        _id:messageId
                    }
                }
            }
        )

        if(updateResult.modifiedCount === 0){
            return Response.json(
                {
                    success:false,
                    message:"Message not found or already deleted"
                },
                {
                    status:404
                }
            )
        }

        /*  const foundUser = await UserModel.findByIdAndUpdate(
            user._id,
            {
                $pull: {
                    messages: {
                        _id: messageId,
                    },
                },
            },
            { new: true }
        );
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );  */

        return Response.json(
            {
                success:true,
                message:"Message Deleted"
            },
            {
                status:200
            }
        )
    
        
    } catch (error) {
        console.error("Error deleting message:",error);
        return Response.json(
            {
                success: false,
                message: 'Error deleting message',
            },
            { 
                status: 500 
            }
        );
        
    }

}