import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
// import mongoose from 'mongoose';
// import User from "../model/user.js"


export const signin = async (req,res) => {
    const { email, password } = req.body;

    try {
        // const existingUser = await User.findOne({ email });

        // if(!existingUser) {
        //     return res.status(404).json({ message: "User doesn't exist. "})
        // }

        const [existingUserArr] = await db.query("SELECT * FROM Users WHERE Email = ?", [email]);

        if (existingUserArr?.length <= 0) {
            console.log("User doesn't exist!");
            return res.status(400).json({ message: "User doesn't exist. "})
        }

        const existingUser = existingUserArr[0];

        console.log("Existing User:", existingUser);
        
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.PasswordHash);

        if(!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials. "})

        const token = jwt.sign({ email: existingUser.Email, id: existingUser.UserID}, "test", {expiresIn: "1h"})

        console.log("Token: ", token);

        res.status(200).json({ result: existingUser, token });
    } catch (err) {
        res.status(500).json({ message: err.message })
    }

    //In google login, make your own token?

}

export const signup = async (req,res) => {
    const { email, password, confirmPassword, fullName, address, phoneNumber, city, postalCode, country, role } = req.body;

    try {

        if(password !== confirmPassword) return res.status(400).json({ message: "Password don't match. "})

        const [existingUser] = await db.query("SELECT * FROM Users WHERE Email = ?", [email]);

        console.log("Existing user: ", existingUser);

        if (existingUser?.length > 0) {
            console.log("Existing user: ", existingUser);
            console.log("User already exists!");
            return res.status(400).json({ message: "User already exist. "})
        }

        const [rowsId] = await db.execute("SELECT MAX(UserID) AS maxId FROM Users");

        let maxId = rowsId[0]?.maxId;

        if(!maxId){
            maxId = "US000";
        } 

        const id = "US" + (parseInt(maxId.substring(2)) + 1).toString().padStart(3, "0");

        if(role.length === 0){
            role = "customer";
        }
        

        const hashedPassword = await bcrypt.hash(password, 12)

        // console.log(firstName, lastName, email);

        // const result = await User.create({ email, password: hashedPassword, firstName: firstName, lastName: lastName})

        const [rows] = await db.query("INSERT INTO Users (UserID, FullName, Email, PasswordHash, PhoneNumber, Address, City, PostalCode, Country, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id, fullName, email, hashedPassword, phoneNumber, address, city, postalCode, country, role]);

        // Get the inserted ID (only if UserID is AUTO_INCREMENT)
        // const insertedId = rows.insertId;

        console.log("Result from rows: ", rows);

        // Fetch the inserted data
        const [rowsResult] = await db.query("SELECT * FROM Users WHERE UserID = ?", [id]);

        // The first row contains the newly inserted user
        const result = rowsResult[0];

        // console.log(newUser);

        console.log("Result: ", result);

        const token = jwt.sign({ email: result.Email, id: result.UserID}, "test", {expiresIn: "1h"})

        res.status(200).json({ result, token }); //result: result (the same)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

export const sign = async (req,res) => {
    const result = req.body;
    const { email, sub } = req.body;
    try {

        const token = jwt.sign({ email: email, id: sub }, "test", {expiresIn: "1h"})

        res.status(200).json({ result, token }); //result: result (the same)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
//E11000 duplicate key error collection: Aero.users index: username_1 dup key: { username: null }"