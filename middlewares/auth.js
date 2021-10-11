const User =  require('../models/user')
const jwt = require('jsonwebtoken')
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

//verificar si el usuario esta autenticado o no
exports.isAuthenticatedUser = catchAsyncErrors(async(req,res, next)=>{
    const {token} =  req.cookies

    if (!token){
        return next(new ErrorHandler('debe loguearse primero', 401))
    }
    
    const decoded =  jwt.verify(token, process.env.JWT_SECRET)
    req.user =  await User.findById(decoded.id)
    next()
})

//manejando roles de usuarios

exports.authorizeRoles = (...roles)=>{
    return (req, res,next)=>{
        if (!roles.includes(req.user.role)){
        return next(new ErrorHandler(`rol ${req.user.role} no tiene acceso permitido`,403))
        }
        next()
    }
}