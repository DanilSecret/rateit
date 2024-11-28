'use server';

import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getUserInf(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        console.error(`Unsupported method: ${req.method}`);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Извлечение токена из заголовка или cookie
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : req.cookies.auth_token;

    if (!token) {
        console.error("Auth token is missing");
        return res.status(401).json({ error: "Authentication token is required" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error("JWT_SECRET is not defined in environment variables");
        return res.status(500).json({ error: "Server configuration error" });
    }

    let decoded: any;
    try {
        // Верификация токена
        decoded = jwt.verify(token, secret);
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            console.error('Token has expired:', error);
            return res.status(401).json({ error: 'Token has expired' });
        } else {
            console.error('Invalid token:', error);
            return res.status(401).json({ error: 'Invalid token' });
        }
    }

    const currentUserId = decoded.userId;

    try {
        // Получение данных пользователя из базы
        const result = await pool.query('SELECT * FROM Users WHERE id = $1', [currentUserId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Возвращаем как данные из токена, так и из базы
        return res.status(200).json({
            userID: decoded.userId,
            userRole: decoded.userRole,
            userData: result.rows[0],
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ error: 'Failed to fetch user data' });
    }
}
