const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({

userId:Number,

items:Array,

total:Number,

provider:String,

status:{
type:String,
default:"pending"
},

trackingNumber:String,

shippingStatus:{
type:String,
default:"processing"
},

createdAt:{
type:Date,
default:Date.now
}

})

module.exports = mongoose.model("Order",OrderSchema)
