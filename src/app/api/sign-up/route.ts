import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(request: Request){
    await dbConnect()

    try {
        const reqBody = await request.json()
        const {username, email, password} = reqBody

        const existingVerifiedUserByUserName = await UserModel.findOne({
            username,
            isVerified:true,
        })

        if(existingVerifiedUserByUserName){
            return Response.json(
            {
                success:false,
                message:"Username is Already taken"
            },
            {
                status:400
            }
        )
        }

        const existingUserByEmail = await UserModel.findOne({email});
        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUserByEmail){
            if (existingUserByEmail.isVerified) {
                
                return Response.json(
                    {
                        success:false,
                        message:"User Already exist with this email"
                    },  
                    {
                        status:400
                    }
                )

            } else {
                const hashedPassword= await bcrypt.hash(password,10);

                existingUserByEmail.username= username;
                existingUserByEmail.password= hashedPassword;
                existingUserByEmail.verifyCode= verifyCode;
                existingUserByEmail.verifyCodeExpiry= new Date(Date.now() + 3600000)

                await existingUserByEmail.save()
                }
        }else{

            const hashedPassword = await bcrypt.hash(password,10);
            const expiryDate= new Date();
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,         
                password: hashedPassword,          
                verifyCode,      
                verifyCodeExpiry: expiryDate,        
                isVerified:false,          
                isAcceptingMessages: true,          
                messages: [],
            })

            await newUser.save();   
        }

        const emailResponse =await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success){
            return Response.json(
                {
                    success:false,
                    message:emailResponse.message,
                },
                {
                    status:500
                }
            )
        }

        return Response.json(
            {
                success:true,
                message:"User Registered SuccessFully. Please verify your account.",
            },
            {
                status:201
            }
        )


    } catch (error) {
        console.log("Error registering User:", error)
        return Response.json(
            {
              success: false,
              message: "Error Registering User",
            },
            { status: 500 }
          );
    }
}