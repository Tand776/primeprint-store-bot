const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({

provider:String,

providerId:String,

title:String,

description:String,

price:Number,

basePrice:Number,

image:String,

category:String,

sales:{
type:Number,
default:0
}

})

module.exports = mongoose.model("Product",ProductSchema)
