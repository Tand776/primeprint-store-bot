const axios = require("axios")

async function createPayment(email,amount){

const res = await axios.post(
"https://api.paystack.co/transaction/initialize",
{
email,
amount: amount * 100
},
{
headers:{
Authorization:`Bearer ${process.env.PAYSTACK_SECRET}`
}
}
)

return res.data.data.authorization_url

}

module.exports = createPayment