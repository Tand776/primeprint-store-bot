function applyMargin(basePrice){

const margin = parseFloat(process.env.PROFIT_MARGIN)

return Number((basePrice + basePrice * margin).toFixed(2))

}

module.exports = applyMargin