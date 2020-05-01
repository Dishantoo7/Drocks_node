const mongoose=require('mongoose');

const UserSchema=mongoose.Schema({
    username:{
        require:true,
        type:String,
        unique:true
    },
    email:{
        require:true,
        type:String,
    },
    number:{
        require:true,
        type:Number
    },
    password:{
        require:true,
        type:String
    },
    bio:{
        type:mongoose.ObjectId,
        default:null
    },
    profilePic:{
        type:String,
        default:null
    },
    date:{
        type:Date,
        default:Date.now
    }
});


module.exports=mongoose.model('Register',UserSchema);