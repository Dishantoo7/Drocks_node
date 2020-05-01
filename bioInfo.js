const mongoose = require('mongoose'); 

const bioSchema = mongoose.Schema({
    name:{
        type:String,
        default:null
    },
    details:{
        type:String,
        default:null
    },
    site:{
        type:String,
        default:null
    }
});

module.exports = mongoose.model('Bio',bioSchema);