const mongoose = require("mongoose")

const CartSchema = new mongoose.Schema({

userId:Number,

items:[
{
productId:String,
title:String,
price:Number,
qty:Number
}
]

})

module.exports = mongoose.model("Cart",CartSchema)
