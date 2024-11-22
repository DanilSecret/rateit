"use server";

import pool from '@/lib/db';
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";


export default async function Login(req, res) {
    if (req.method === "POST") {
        try {
            const {username, password} = req.body

            try {
                const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
                const userData = result.rows[0];
                if (!userData) {
                    return res.status(401).json({ message: "Invalid username or password" });
                }

                const passwordMatch = await compare(password, userData.password);
                if (!passwordMatch) {
                    return res.status(401).json({ message: "Invalid username or password" });
                }

                const token = jwt.sign({userId: userData.id, userRole: userData.role, profileAccess: false}, process.env.JWT_SECRET);
                const serializedCookie = serialize('auth_token', token, {
                    httpOnly: false,
                    sameSite: 'strict',
                    maxAge: 86400,
                    path: '/',
                });

                res.setHeader('Set-cookie', serializedCookie);
                res.status(200).json({ message: 'Login successful', redirectUrl: '/' });
            }catch (error) {
                console.error(error.stack);
                return res.status(500).json({ message: "Internal server error" });
            }finally {
                await pool.end();
            }

        }catch (error) {
            console.log(error)
            res.status(400).end();

        }
    }
}