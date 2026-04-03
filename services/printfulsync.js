const axios = require("axios")
const Product = require("../models/Product")
const applyMargin = require("../utils/marginCalculator")

async function syncPrintful(){

const res = await axios.get(
"https://api.printful.com/store/products",
{
headers:{
Authorization:`Bearer ${process.env.PRINTFUL_API_KEY}`
}
}
)

for(const p of res.data.result){

const base = p.variants[0].retail_price

await Product.updateOne(
{providerId:p.id},
{
provider:"printful",
providerId:p.id,
title:p.name,
basePrice:base,
price:applyMargin(base),
image:p.thumbnail_url
},
{upsert:true}
)

}

}

module.exports = syncPrintful