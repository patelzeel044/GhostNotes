import mongoose, {Schema,Document} from "mongoose";

export interface Message extends Document {
    content:string;
    createdAt:Date;
}

const MessageSchema: Schema<Message> = new Schema({
content:{
    type:String,
    required:[true, "content is required"],
},
createdAt:{
    type:Date,
    required:true,
    default:Date.now    
}
})


export interface User extends Document {
    username:string;
    email:string;          
    password:string;          
    verifyCode:string;          
    verifyCodeExpiry:Date;          
    isVerified:Boolean;          
    isAcceptingMessages:Boolean;          
    messages:Message[];          
}


const UserSchema: Schema<User> = new Schema({
    username:{
        type:String,
        required:[true, "username is required"],
        trim:true,
        unique:true,
    },
    email:{
        type:String,
        required:[true, "email is required"],
        unique:true,
        match: [/.+\@.+\..+/, 'Please use a valid email address'],
    },
    password:{
        type:String,
        required:[true, "password is required"],
    },
    verifyCode:{
        type:String,
        required:[true, "verify Code is required"],
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true, "verify Code Expiry is required"],
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAcceptingMessages:{
        type:Boolean,
        default:false
    },
    messages:[MessageSchema]
    })

    const UserModel = (mongoose.models.User) || mongoose.model('User', UserSchema)

    export default UserModel;