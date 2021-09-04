const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  phone: String,
  address: String
},{timestamps:true});


// static method to login doc
userSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email }).catch(err=>{console.log(err)});
  if (user) {
    const auth = (password === user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect username');
};

const User = mongoose.model('user', userSchema);

module.exports = User;