const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
  email: String,
  password: String,
  specialization: String,
  name: String,
  phone: number
},{timestamps:true});


// static method to login doc
docSchema.statics.login = async function(email, password) {
  const doc = await this.findOne({ email }).catch(err=>{console.log(err)});
  if (doc) {
    const auth = (password === doc.password);
    if (auth) {
      return doc;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect username');
};

const Doctor = mongoose.model('doctor', docSchema);

module.exports = Doctor;