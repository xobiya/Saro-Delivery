const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('Food_Delivery_Platform_Requirements.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(function(error) {
    console.error('Error reading PDF:', error);
});
