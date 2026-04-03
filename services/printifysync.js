const axios = require("axios")
const Product = require("../models/Product")
const applyMargin = require("../utils/marginCalculator")

async function syncPrintify(){

const res = await axios.get(
`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
{
headers:{
Authorization:`Bearer ${process.env.PRINTIFY_API_KEY}`
}
}
)

for(const p of res.data.data){

const base = p.variants[0].price/100

await Product.updateOne(
{providerId:p.id},
{
provider:"printify",
providerId:p.id,
title:p.title,
description:p.description,
basePrice:base,
price:applyMargin(base),
image:p.images[0].src
},
{upsert:true}
)

}

}

module.exports = syncPrintify