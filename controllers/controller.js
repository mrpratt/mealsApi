const {userData, orderData, validateData, validateOrderData} = require("../models/models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.registerUser = async (req, res) => {
    try {
        const {error} = validateData(req.body);
        if (error) return res.status(400).send(error.message);

        const {name, email, password} = req.body;
        if (!(email && password && name)) {
            res.status(400).send("All input reqd.");
        }
        const oldUser = await userData.findOne({email});

        if (oldUser) {
            res.status(400).send("Email already registered!!.");
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        let encPassword = await bcrypt.hash(password, salt);

        const user = await userData.create({
            name,
            email: email,
            password: encPassword
        })

        const token = jwt.sign({
                user_id: user._id, email: email
            }, process.env.TOKEN_SECRET, {
                "expiresIn": "3h"
            }
        );
        user.token = token;
        await user.save();

        res.status(200).json(user);
    } catch
        (error) {
        //duplicate key err
        if (error.code === 11000)
            res.status(400).json({err: 'Email already exist!'});
        else
            res.status(400).json({message: error.message});
    }
}

module.exports.loginUser = async (req, res) => {
    try {

        const {email, password} = req.body;
        if (!(email && password)) {
            res.status(400).send("All input reqd.");
        }

        const user = await userData.findOne({email});

        if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign({user_id: user._id, email: email}, process.env.TOKEN_SECRET, {
                "expiresIn": "3h"
            });

            user.token = token;
            res.status(200).json(user);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({message: error.message});
    }
}


module.exports.createOrder = async (req, res) => {
    try {
        const {error} = validateOrderData(req.body);
        if (error) return res.status(400).send(error.message);

        let orderName = req.body.orderName;
        let orderType = req.body.orderType.toLowerCase();
        let status = req.body.orderStatus;
        let canOrder = false;

        let current = new Date();
        let currentHour = current.getHours();

        if (orderType === 'lunch' || orderType === 'dinner') {
            if (!(orderName && orderType)) {
                res.status(400).send("All inputs are required.");
            }

            const order = await orderData.create({
                orderName: orderName,
                orderType: orderType,
                orderDate: new Date(),
                orderStatus: status,
            });

            if (orderType === 'lunch' && currentHour < 9)
                canOrder = true;

            if (orderType === 'dinner' && currentHour < 18)
                canOrder = true;

            if (canOrder) {
                await order.save();
                res.status(200).json(order);
            } else {
                res.status(400).json({message: "Cannot order Lunch After 9AM and Dinner After 6PM!!"});
            }

        } else {
            res.status(400).json({message: "Invalid Order Type!!"});
        }

    } catch
        (error) {
        console.log(error);
        res.status(400).json({message: error.message});
    }
}


module.exports.cancelOrder = async (req, res) => {
    try {

        const id = req.params.id;
        const findData = await orderData.findById(id);
        let current = new Date();
        let currentHour = current.getHours();

        let canOrder = false;

        if (findData.orderType === 'lunch' && currentHour < 9)
            canOrder = true;

        if (findData.orderType === 'dinner' && currentHour < 18)
            canOrder = true;

        if (canOrder) {
            const data = await orderData.findByIdAndDelete(id);
            res.status(200).send(`Order with ${data.orderName} has been Cancelled..`);
        } else {
            res.status(400).json({message: "Cannot order Lunch After 9AM and Dinner After 6PM!!"});
        }

    } catch
        (error) {
        console.log(error);
        res.status(400).json({message: error.message});
    }
}

module.exports.logout = async (req, res) => {
    try {

        const authHeader = req.headers["authorization"];
        jwt.sign(authHeader, "", {expiresIn: 1}, (logout, err) => {
            if (logout) {
                res.send({msg: 'You have been Logged Out'});
            } else {
                res.send({msg: 'Error'});
            }
        });
    } catch
        (error) {
        console.log(error);
        res.status(400).json({message: error.message});
    }
}
