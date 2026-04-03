require("dotenv").config()

const TelegramBot = require("node-telegram-bot-api")
const connectDB = require("./config/db")

const Product = require("./models/Product")
const Cart = require("./models/Cart")
const Order = require("./models/Order")

const createPayment = require("./services/paystack")

connectDB()

const bot = new TelegramBot(process.env.BOT_TOKEN,{ polling:true })

const PRODUCTS_PER_PAGE = 5

const categories=[
"MEN","WOMEN","KIDS","SPORTSWEAR","HOODIES","SHOES",
"PHONE CASES","BABY CLOTHING","MUGS","HATS","BAGS",
"SOCKS","TOWELS","MOUSE PADS","PILLOWS & COVERS"
]

/* START */

bot.onText(/\/start/,msg=>{

bot.sendMessage(msg.chat.id,
"🛍 Welcome to PrimePrint Store",
{
reply_markup:{
keyboard:[
["🛒 Browse Categories"],
["🔥 Best Sellers","🔎 Search Product"],
["🧺 My Cart"],
["📦 Track Order"]
],
resize_keyboard:true
}
}
)

})

/* CATEGORY MENU */

bot.onText(/🛒 Browse Categories/,msg=>{

bot.sendMessage(msg.chat.id,"Select category:",{
reply_markup:{
keyboard:[
["MEN","WOMEN"],
["KIDS","SPORTSWEAR"],
["HOODIES","SHOES"],
["PHONE CASES","BABY CLOTHING"],
["MUGS","HATS"],
["BAGS","SOCKS"],
["TOWELS","MOUSE PADS"],
["PILLOWS & COVERS"],
["⬅ Back"]
],
resize_keyboard:true
}
})

})

/* PRODUCT PAGINATION */

async function sendProductPage(chatId,category,page){

try{

const skip=(page-1)*PRODUCTS_PER_PAGE

const products=await Product
.find({category})
.skip(skip)
.limit(PRODUCTS_PER_PAGE)

if(!products.length){
return bot.sendMessage(chatId,"No products found.")
}

const total=await Product.countDocuments({category})
const pages=Math.ceil(total/PRODUCTS_PER_PAGE)

for(const p of products){

await bot.sendPhoto(chatId,p.image,{
caption:`${p.title}

Price: $${p.price}`,
reply_markup:{
inline_keyboard:[
[{text:"Add to Cart",callback_data:`add_${p._id}`}]
]
}
})

}

let nav=[]

if(page>1)
nav.push({text:"⬅ Previous",callback_data:`page_${category}_${page-1}`})

nav.push({text:`Page ${page}/${pages}`,callback_data:"ignore"})

if(page<pages)
nav.push({text:"Next ➡",callback_data:`page_${category}_${page+1}`})

bot.sendMessage(chatId,"Browse more products:",{
reply_markup:{inline_keyboard:[nav]}
})

}catch(err){

console.error(err)

bot.sendMessage(chatId,"Error loading products.")

}

}

/* CATEGORY HANDLER */

bot.on("message",async msg=>{

const text=msg.text
const chatId=msg.chat.id

if(categories.includes(text)){

sendProductPage(chatId,text,1)

}

})

/* BEST SELLERS */

bot.onText(/🔥 Best Sellers/,async msg=>{

try{

const products=await Product.find()
.sort({sales:-1})
.limit(5)

for(const p of products){

bot.sendPhoto(msg.chat.id,p.image,{
caption:`🔥 Bestseller

${p.title}

Price: $${p.price}`,
reply_markup:{
inline_keyboard:[
[{text:"Add to Cart",callback_data:`add_${p._id}`}]
]
}
})

}

}catch(err){

console.error(err)

bot.sendMessage(msg.chat.id,"Error loading best sellers.")

}

})

/* SEARCH PRODUCT */

bot.onText(/🔎 Search Product/,msg=>{

bot.sendMessage(msg.chat.id,"Type product name to search:")

})

bot.on("message",async msg=>{

if(!msg.text) return

const keyword=msg.text.toLowerCase()

const products=await Product.find({
title:{$regex:keyword,$options:"i"}
}).limit(5)

if(products.length===0) return

for(const p of products){

bot.sendPhoto(msg.chat.id,p.image,{
caption:`${p.title}

Price: $${p.price}`,
reply_markup:{
inline_keyboard:[
[{text:"Add to Cart",callback_data:`add_${p._id}`}]
]
}
})

}

})

/* CART */

bot.on("callback_query",async query=>{

try{

if(query.data.startsWith("add_")){

const productId=query.data.split("_")[1]

const product=await Product.findById(productId)

await Cart.updateOne(
{userId:query.from.id},
{$push:{items:{
productId,
title:product.title,
price:product.price,
qty:1
}}},
{upsert:true}
)

bot.sendMessage(query.message.chat.id,"✅ Added to cart")

}

}catch(err){

console.error(err)

}

})

/* VIEW CART */

bot.onText(/🧺 My Cart/,async msg=>{

try{

const cart=await Cart.findOne({userId:msg.from.id})

if(!cart){
return bot.sendMessage(msg.chat.id,"Cart is empty.")
}

let total=0
let text="🧺 Your Cart\n\n"

cart.items.forEach(i=>{
text+=`${i.title} - $${i.price}\n`
total+=i.price
})

text+=`\nTotal: $${total}`

bot.sendMessage(msg.chat.id,text,{
reply_markup:{
inline_keyboard:[
[{text:"Checkout",callback_data:"checkout"}]
]
}
})

}catch(err){

console.error(err)

}

})

/* PAGINATION + CHECKOUT */

bot.on("callback_query",async query=>{

try{

if(query.data.startsWith("page_")){

const parts=query.data.split("_")

const category=parts[1]
const page=parseInt(parts[2])

sendProductPage(query.message.chat.id,category,page)

}

if(query.data==="checkout"){

const cart=await Cart.findOne({userId:query.from.id})

if(!cart) return

let total=0

cart.items.forEach(i=> total+=i.price)

const paymentLink=await createPayment(
`${query.from.id}@telegram.com`,
total
)

bot.sendMessage(query.message.chat.id,
`💳 Complete your payment:

${paymentLink}`)

}

}catch(err){

console.error(err)

}

})

/* TRACK ORDER */

bot.onText(/📦 Track Order/,async msg=>{

try{

const orders=await Order.find({userId:msg.from.id})

if(!orders.length){
return bot.sendMessage(msg.chat.id,"No orders found.")
}

orders.forEach(o=>{

bot.sendMessage(msg.chat.id,
`Order ID: ${o._id}

Status: ${o.shippingStatus}

Tracking: ${o.trackingNumber || "Not available yet"}`)

})

}catch(err){

console.error(err)

}

})