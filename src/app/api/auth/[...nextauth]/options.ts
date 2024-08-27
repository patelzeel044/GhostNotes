import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/user.model';
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";


export const authOptions: NextAuthOptions = {
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials:any) : Promise<any>{
                await dbConnect()
                try {
                const user = await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })

                    if(!user){
                        throw new Error("no user Found with this Email")
                    }
                    
                    if(!user.isVerified){
                        throw new Error("please verify your account before login")
                    }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if(isPasswordCorrect){
                        return user
                    }else{
                        throw new Error("Incorrect Password")
                    }

                } catch (error:any) {
                    
                    throw new Error(error)
                }
            },

            }),
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            }),
            GitHubProvider({
                clientId: process.env.GITHUB_ID!,
                clientSecret: process.env.GITHUB_SECRET!,
            }),
    ],
    callbacks:{
        async jwt({ token, user, account, profile }) {

        if(user) { 
                    token._id = user._id?.toString();
                    token.isVerified=user.isVerified;
                    token.isAcceptingMessages = user.isAcceptingMessages;
                    token.username = user.username;
                    }    
                if (
                    (account?.provider === "github" ||
                    account?.provider === "google") &&
                    profile
                ) {
                    const { email } = profile;
    
                    if (email?.endsWith("@gmail.com")) {
                        try {
                            await dbConnect();
                            const foundUser = await UserModel.findOne({ email });
    
                            token._id = foundUser?._id.toString();
                            token.username = foundUser?.username;
                            token.isVerified = foundUser?.isVerified;
                            token.acceptMessages = foundUser?.acceptMessages;
                        } catch (error) {
                            console.error("Error signing in with your provider Google/Github", error);
                            throw new Error("Error signing in with your provider Google/Github");
                        }
                    }
                }
            return token
        },
        async session({ session, token }) {  
            if (token) {
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
        },
        async signIn({ account, profile }) {
            if (
                (account?.provider === "github" ||
                    account?.provider === "google") &&
                profile
            ) {
                const { email, name } = profile;
                if (email?.endsWith("@gmail.com")) {
                    try {
                        await dbConnect();
                        let foundUser = await UserModel.findOne({ email });

                        if (!foundUser) {
                            const randomNum = Math.floor(
                                100 + Math.random() * 900
                            ).toString();
                            const username = name?.split(" ").join("-").concat(randomNum);
                            const new_user = new UserModel({
                                username,
                                email,
                                isVerified: true,
                                acceptMessages: true,
                            });

                            await new_user.save({ validateBeforeSave: false });
                        }

                        return true;
                    } catch (error) {
                        console.error("Error signing in with Google", error);
                        throw new Error("Error signing in with Google");
                    }
                }
                return false;
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in',
    },

}