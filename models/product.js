const mongoose = require('mongoose')

const productSchema =  new mongoose.Schema({
name:{
    type:String,
    required:[true, 'por favor ingrese un nombre al producto'],
    trim:true,
    maxlength:[100,'el nombre del producto debe tener maximo 100 caracteres']
},

price:{
    type:Number,
    required:[true, 'por favor ingrese un precio al producto'],
    maxlength:[5,'el nombre del producto mo debe tener mas de 5 caracteres'],
    default:0.0
},

description:{
    type:String,
    required:[true, 'por favor ingrese una descripcion al producto'],
},


ratings:{
    type:Number,
    default:0
},
images:[
    {
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        },
    }
],
    category:{
    type:String,
    required:[true, 'por favor selecciona categoria para este producto'],
    enum:{
        values:[
            'Electronics',
            'Cameras',
            'Laptops',
            'Accessories',
            'Headphones',
            'Food',
            "Books",
            'Clothes/Shoes',
            'Beauty/Health',
            'Sports',
            'Outdoor',
            'Home'
        ],
        message:'por favor selecciona la categoria correcta por producto'
    }
},
    seller:{
        type:String,
        required:[true, 'por favor ingrese vendedor(a)']  
    },
    stock:{
        type:Number,
        required:[true,'por favor ingrese stock del producto'],
        maxlength:[true, 'el stock no puede exceder 5 caracteres'],
        default:0
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    reviews:[{
        user:{
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required:true
        },
        name:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            required:true,
        },
         comment:{
             type:String,
             required:true
         }
    }],
    
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model('Product', productSchema)