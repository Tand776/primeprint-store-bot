const axios = require("axios")

async function createPrintifyOrder(order){

const res = await axios.post(
`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/orders.json`,
{
line_items: order.items.map(i=>({
product_id:i.productId,
quantity:i.qty
})),

shipping_method:1,

send_shipping_notification:true
},
{
headers:{
Authorization:`Bearer ${process.env.PRINTIFY_API_KEY}`
}
}
)

return res.data

}

module.exports = createPrintifyOrder