const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
  name: String,
  numberAddresses: Number,
  numberPatients: Number,
  sumForStudy: String,
  sumToOneAddress: Number,
  tokenAddress: String,
  transaction: String,
  idPatients: [mongoose.Schema.Types.ObjectId], 
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
},
}, {
    timestamps: true
}); 

const Research = mongoose.model('Research', researchSchema);

module.exports = Research;
