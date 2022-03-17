const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const router = express.Router();
const dataFilePath = path.join(__dirname, "./users.json");

const convertToHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

const comparePassword = async (password1, password2) => {
    return await bcrypt.compare(password1, password2);
}

const onLogin = async (req, res, next) => {
    try {
        const data = fs.readFileSync(dataFilePath);
        const users = JSON.parse(data);
        const { email, password } = req.body;
        const index = users.findIndex(user => { return user.email === email });
        if (!(email && password))
            return res.json({ status: 4, data: "Invalid input" });

        if (index > -1) {
            const user = users[index];
            const isPasswordMatches = await comparePassword(password, user.password);
            if (isPasswordMatches)
                return res.json({ status: 1, data: user });
            return res.json({ status: 2, data: "Password is incorrect" });
        }
        res.json({ status: 3, data: "Email is NOT exists" });
    } catch (e) {
        next(e);
    }
};

const onRegister = async (req, res, next) => {
    try {
        const data = fs.readFileSync(dataFilePath);
        const users = JSON.parse(data);
        const { name, email, password } = req.body;
        if (!(name && email && password))
            return res.json({ status: 3, data: "Invalid input" });

        const index = users.findIndex(user => { return user.email === email });
        if (index >= 0)
            return res.json({ status: 2, data: "Email is exists" });
        const hash = await convertToHash(password);
        const user = {
            id: (users.length + 1) || 1,
            name: name,
            email: email,
            password: hash
        }
        users.push(user);
        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 4));
        res.json({ status: 1, data: user });
    } catch (e) {
        next(e);
    }
};

router
    .route('/api/v1/login')
    .post(onLogin);


router
    .route('/api/v1/register')
    .post(onRegister);

module.exports = router;