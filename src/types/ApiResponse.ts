import { Message } from "@/model/user.model";

export interface ApiResponse{
    success:boolean,
    message:string,
    isAcceptingMessages?:string,
    messages?:Array<Message>

}