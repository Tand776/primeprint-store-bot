const axios = require("axios")

async function createPrintfulOrder(order){

const res = await axios.post(
"https://api.printful.com/orders",
{
items: order.items.map(i=>({
variant_id:i.productId,
quantity:i.qty
}))
},
{
headers:{
Authorization:`Bearer ${process.env.PRINTFUL_API_KEY}`
}
}
)

return res.data

}

module.exports = createPrintfulOrder