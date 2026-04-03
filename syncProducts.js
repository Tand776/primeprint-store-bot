require("dotenv").config()

const mongoose = require("mongoose")
const axios = require("axios")
const cron = require("node-cron")

const Product = require("./models/Product")

const applyMargin = require("./utils/marginCalculator")
const mapCategory = require("./utils/categoryMapper")

/* CONNECT DATABASE */

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("Database connected"))
.catch(err=> console.error(err))

/* PRINTIFY SYNC */

async function syncPrintify(){

try{

const res = await axios.get(
`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
{
headers:{
Authorization:`Bearer ${process.env.PRINTIFY_API_KEY}`
}
}
)

const products = res.data.data

for(const p of products){

const basePrice = p.variants[0].price / 100

await Product.updateOne(
{providerId:p.id},
{
provider:"printify",
providerId:p.id,

title:p.title,
description:p.description,

basePrice:basePrice,
price:applyMargin(basePrice),

image:p.images[0].src,

category:mapCategory(p.title)
},
{upsert:true}
)

}

console.log("Printify products synced")

}catch(err){

console.error("Printify sync error:",err.message)

}

}


/* PRINTFUL SYNC */

async function syncPrintful(){

try{

const res = await axios.get(
"https://api.printful.com/store/products",
{
headers:{
Authorization:`Bearer ${process.env.PRINTFUL_API_KEY}`
}
}
)

const products = res.data.result

for(const p of products){

const basePrice = parseFloat(p.variants[0].retail_price)

await Product.updateOne(
{providerId:p.id},
{
provider:"printful",
providerId:p.id,

title:p.name,

basePrice:basePrice,
price:applyMargin(basePrice),

image:p.thumbnail_url,

category:mapCategory(p.name)
},
{upsert:true}
)

}

console.log("Printful products synced")

}catch(err){

console.error("Printful sync error:",err.message)

}

}


/* RUN SYNC */

async function syncProducts(){

console.log("Starting product sync...")

await syncPrintify()

await syncPrintful()

console.log("Product sync complete")

}


/* INITIAL RUN */

syncProducts()


/* AUTO SYNC EVERY HOUR */

cron.schedule("0 * * * *",async ()=>{

console.log("Running scheduled product sync...")

await syncProducts()

})