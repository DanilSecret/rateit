'use server';

import pool from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getUser(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error('Authorization header is missing or invalid');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];

        let decoded: any;

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (error) {
            console.error('Invalid token:', error);
            return res.status(401).json({ error: 'Token is not valid' });
        }

        const currentUserId = decoded.userId;

        try {
            const result = await pool.query('SELECT * FROM Users WHERE id = $1', [currentUserId]);
            console.log(result)
            return res.status(200).json({ result: result.rows[0] });
        } catch (error) {
            console.error('Error fetching user data:', error);
            return res.status(500).json({ error: 'Failed to fetch user data' });
        } finally {
            await pool.end();
        }
    } else {
        console.error('Method is not allowed');
        return res.status(405).end();
    }
}
