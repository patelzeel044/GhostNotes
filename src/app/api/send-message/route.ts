import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";

export async function POST (request: Request) {
    await dbConnect();

    try {
        
        const {username, content} = await request.json();

        const user= await UserModel.findOne({username})

        
    if(!user){
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

    if(!user.isAcceptingMessages){
        return Response.json(
            {
                success:false,
                message:"User is not accepting messages"
            },
            {
                status:403
            }
        )
    }

    const newMessage= {
        content,
        createdAt: new Date()
    }

    console.log(newMessage,"newmsg")

    if (!user.messages) {
        user.messages = [];
    }
    

    user.messages.push(newMessage as Message);
    await user.save({validateBeforeSave: false});

    return Response.json(
        {
            success:true,
            message:"Message sent successfully"
        },
        {
            status:201
        }
    )

    } catch (error) {
        console.error("Failed to send message to user",error);
        
        return Response.json(
            {
                success: false,
                message: "Failed to send message to user",
            },
            { 
                status: 500 
            }
        );
    }

}