const User = require("../models/user");

const ErrorHandler = require("../utils/errorHandler");

const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const sendToken = require("../utils/jwtToken");

const sendEmail = require('../utils/sendEmail');

const crypto = require('crypto')

//registrar un usuario = /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar:{
    public_id:'ohvwabkyfnh65vgig2wc',
    url:'https://res.cloudinary.com/ejmorales/image/upload/v1632092484/ohvwabkyfnh65vgig2wc.jpg'       
    }
  })

  sendToken(user, 200,res)

});

//login user => api/v1/login

exports.loginUser = catchAsyncErrors(async(req, res, next)=>{
    const {email, password} = req.body

    //vertificar si email o usuario es ingresado por el usuario
    if(!email || !password){
        return next(new ErrorHandler('por favor ingrese email y password',400))
    }

    //buscando usuarios 
    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorHandler('password o email invalido',401))
    }
    //verificar si el password es correcto o no
    const isPasswordMatched = await user.comparePassword(password)

    if (!isPasswordMatched){
        return next(new ErrorHandler('password o email invalido',401))
    }

    sendToken(user, 200,res)


})

//forgot password => /api/v1/password/forgot

exports.forgotPassword =  catchAsyncErrors(async(req, res,next)=>{
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler('usuario no encontrado con este email',404))


    }

    //get reset token

    const resetToken =  user.getResetPasswordToken()

    await user.save({validateBeforeSave:false})

    //create password url 

 
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    const message = `recuperar password en:\n\n${resetUrl}\n\n si no necesitas recuperar tu password ignora este email`
    
    try {
        
        await sendEmail({
            email: user.email,
            subject:'recuperar password Polvo de Estrellas',
            message
        })

        res.status(200).json({
            success: true,
            message:`email ha sido enviado a ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler(error.message, 500))
    }
    
})

//reset password =>  /api/v1/password/reset/:token
exports.resetPassword =  catchAsyncErrors(async(req, res,next)=>{

    //hash url token

    const resetPasswordToken =  crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user =  await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{  $gt:Date.now() }

    })

    if(!user){
        return next(new ErrorHandler('clave de reset password es invalida o ha expirado', 400))

    }

    if (req.body.password != req.body.confirmPassword){
        return next(new ErrorHandler('password no concuerda',400))
    }

    //setup nuevo password

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    sendToken(user, 200,res)
})

//currently user loged in => /api/v1/me

exports.getUserProfile = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        user
    })
})

//update//password => /api/v1/password/update 
exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password')

    //check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched){
        return next(new ErrorHandler('password anterior es incorrecto',400))
    }

    user.password = req.body.password
    await user.save()

    sendToken(user,200,res)
})

//update user profile => /api/v1/me/update

exports.updateProfile = catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }
    //actualizar avatar TAREA
    const user = await User.findByIdAndUpdate(req.user.id, newUserData,{
        new:true,
        runValidators:true,
    })

    res.status(200).json({
        success:true,

    })
})


//logout user => /api/v1/logout

exports.logout = catchAsyncErrors(async(req, res, next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success: true,
        message:'logged out'
    })
})

//admin routes //

//get all users =>/api/v1/admin/users 

exports.allUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find()

    res.status(200).json({
        success:true,
        users
    })
})

//get users detailed => /api/v1/admin/user/:id 

exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if (!user){
        return next(new ErrorHandler(`usuario no encontrado con id ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//update user profile => /api/v1/admin/user/:id
exports.updateUser = catchAsyncErrors(async(req,res,next)=>{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new:true,
        runValidators:true

    })

    res.status(200).json({
        success:true,

    })
})

//delete user =>/api/v1/admin/user/:id

exports.deleteUser = catchAsyncErrors(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if (!user){
        return next(new ErrorHandler(`usuario no encontrado con id ${req.params.id}`))
    }

    //remover avatar de cloudinary TAREA

    await user.remove()

    res.status(200).json({
        success:true,
        
    })
})