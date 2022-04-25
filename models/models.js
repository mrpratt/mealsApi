const mongoose = require('mongoose');
const Joi = require("joi");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    }
});

const userData = mongoose.model("userData", UserSchema);

const OrderSchema = new mongoose.Schema({
    orderName: {
        type: String,
        required: true,
    },
    orderType: {
        type: String,
        required: true,
    },
    orderDate: {
        type: Date,
    },
    orderStatus: {
        type: Number
    },
    userId: {
        type: String,
    },
});

const orderData = mongoose.model("orderData", OrderSchema);


const validateData = (user) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(user);
};


const validateOrderData = (user) => {
    const schema = Joi.object({
        orderName: Joi.string().required(),
        orderType: Joi.string().required(),
        orderStatus: Joi.number().required(),
    });
    return schema.validate(user);
};
module.exports = {userData, orderData, validateData, validateOrderData};

