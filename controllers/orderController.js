import userModel from "../models/userModel.js"
import orderModel from "../models/orderModel.js"
import Stripe from 'stripe'

// Global variables

const currency = 'inr'
const deliveryCharge = 10

// Gateway initialize

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Placing orders using COD Method

const placeOrder = async(req,res) => {
    try {
        const { userId, items, amount, address } = req.body

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId,{cartData:{}})

        res.json({success:true, message:"Order Placed"})


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    
    }


}

// Placing orders using Stripe Method

const placeOrderStripe = async(req,res) => {
    try {
        
        const {userId, items, amount, address} = req.body
        const{ origin } = req.headers //origin is frontend url

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"Stripe",
            payment:false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        const line_items = items.map( (item) => ({
            price_data : {
                currency:currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))  //Item is array thats why using map method

        line_items.push({
            price_data : {
                currency:currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({

            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true,session_url:session_url});

        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
    
}

// Verify Stripe

const verifyStripe = async(req,res) => {

    const{orderId, success, userId} = req.body

    try {
        if(success === "true"){
            await orderModel.findByIdAndUpdate(orderId, {payment:true});
            await userModel.findByIdAndUpdate(userId, {cartData:{}}) // To clear cart data
        }
    } catch (error) {
        
    }
}

// Placing orders using Razorpay Method

const placeOrderRazorpay = async(req,res) => {
    
}

// All orders data for Admin Panel
const allOrders = async(req,res) => {

    try {
        const orders = await orderModel.find({})
        res.json({success:true, orders})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
    
}

// All orders data for Frontend

const userOrders = async(req,res) => {
    
    try {
        const{userID} = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})
        


    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}

// Update order status from Admin panel
const updateStatus = async(req,res) => {

    try {
        
        const{orderId,status} = req.body
        
        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true, message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
    
}

export {placeOrder,placeOrderStripe,placeOrderRazorpay,allOrders,userOrders,updateStatus}