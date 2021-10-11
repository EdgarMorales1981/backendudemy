const mongoose = require('mongoose')

const validator = require('validator')

const bcrypt =  require('bcryptjs')

const jwt = require('jsonwebtoken')

const crypto = require('crypto')

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required:[true, 'por favor ingrese su nombre'],
    maxlength:[30, 'no puedes exceder los 30 caracteres']
},
email:{
    type:String,
    required:[true,'por favor ingrese un email'],
    unique:true,
    validate:[validator.isEmail, 'por favor ingrese un email valido']
},
password:{
    type:String,
    required:[true,'por favor ingrese su password'],
    minlength:[6, 'su password debe ser de minimo 6 caracteres'],
    select:false
},
avatar:{
    public_id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    }
},
role:{
    type:String,
    default:'user'
},
createdAt:{
    type:Date,
    default: Date.now
},
resetPasswordToken:String,
resetPasswordExpire:Date
})

//encriptar datos antes de guardar
userSchema.pre('save', async function(next){
    if (!this.isModified('password')){
        next()
    }
    this.password =  await bcrypt.hash(this.password,10)
})


//compare user password

userSchema.methods.comparePassword = async function(enteredPassword){
return await bcrypt.compare(enteredPassword, this.password)
}

//return jwt 

userSchema.methods.getJwtToken  = function(){
    return jwt.sign({id:this._id}, process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

//generate password reset token
userSchema.methods.getResetPasswordToken =  function(){
    //generate token
    const resetToken = crypto.randomBytes(20).toString('hex')

    //hash and reset password token
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    //set token expires time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000 

    return resetToken
}

module.exports = mongoose.model('User', userSchema)