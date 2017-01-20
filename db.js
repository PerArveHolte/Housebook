var mongoose = require('mongoose');

//mongoose.connect('mongodb://localhost/housebook');
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
});
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + process.env.MONGODB_URI);
}); 
module.exports = mongoose;