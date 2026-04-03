function mapCategory(title){

title = title.toLowerCase()

if(title.includes("hoodie")) return "HOODIES"
if(title.includes("mug")) return "MUGS"
if(title.includes("hat")) return "HATS"
if(title.includes("shoe")) return "SHOES"
if(title.includes("sock")) return "SOCKS"
if(title.includes("bag")) return "BAGS"
if(title.includes("phone")) return "PHONE CASES"
if(title.includes("pillow")) return "PILLOWS & COVERS"
if(title.includes("mouse")) return "MOUSE PADS"
if(title.includes("towel")) return "TOWELS"

return "MEN"

}

module.exports = mapCategory