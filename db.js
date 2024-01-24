const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config();

// const mongoUri ="mongodb+srv://main:MainATnoteswift9@noteswift.ngfs69r.mongodb.net/noteswift?retryWrites=true&w=majority"
const mongoUri = "mongodb+srv://main:MainATnoteswift9@noteswift.ngfs69r.mongodb.net/?retryWrites=true&w=majority"

const connectToMongo = async () =>{
    try{
        await mongoose.connect(mongoUri)
        console.log('mongo connected')
    }catch(error){
        console.log('error'+error)
    }
}
module.exports = connectToMongo;