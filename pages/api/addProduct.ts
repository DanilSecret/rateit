"use server";

import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";


export default async function AddProduct(req: NextApiRequest, res: NextApiResponse){
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Метод не поддерживается" });
    }
    const { name, image, average_rating, company } = await req.body;

    try {
        // Проверяем, существует ли пользователь
        const existingProduct = await pool.query('SELECT * FROM products WHERE name = $1', [name]);
        if (existingProduct.rows.length > 0) {
            return res.status(400).json({ message: 'Товар уже существует' });
        }

        // Сохраняем пользователя в базу данных
        const result = await pool.query(
            'INSERT INTO products (name, image, company) VALUES ($1, $2, $3) RETURNING *',
            [name, image, company]
        );

        const newProduct = result.rows[0];

        // Возвращаем ответ
        res.status(201).json({
            product: {
                name: newProduct.name,
                image: newProduct.image,
                company: newProduct.company
            },
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
}