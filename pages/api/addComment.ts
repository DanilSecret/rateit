"use server";

import { NextApiRequest, NextApiResponse } from "next";
import pool from "@/lib/db";
import jwt from "jsonwebtoken";

// Секрет для подписи JWT (должен быть скрыт в переменных окружения)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default async function AddComment(req: NextApiRequest, res: NextApiResponse) {

    const { id } = req.query; // Получаем ID товара из query-параметров

    if (!id) {
        return res.status(400).json({ error: 'ID товара отсутствует' });
    }

    // Получаем токен из заголовков
    const token = req.body.cookie.auth_token;
    console.log(token)

    if (!token) {
        return res.status(401).json({ message: "Токен не предоставлен" });
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Метод не поддерживается" });
    }

    const { rate, description, plus, minus, buy_method, price } = req.body.data;

    if (!rate || !description) {
        return res.status(400).json({ message: "Все обязательные поля должны быть заполнены" });
    }

    try {
        // Декодируем токен и извлекаем данные пользователя
        const decoded: any = jwt.verify(token, JWT_SECRET);
        console.log(decoded)
        const user_id = decoded.userId;
        const author = decoded.username;

        console.log(user_id)
        console.log(author)

        // Проверяем, существует ли продукт
        const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (existingProduct.rows.length === 0) {
            return res.status(400).json({ message: 'Продукт не найден' });
        }

        // Проверяем, существует ли пользователь (по ID из токена)
        const existingUser = await pool.query('SELECT * FROM Users WHERE id = $1', [user_id]);
        if (existingUser.rows.length === 0) {
            return res.status(400).json({ message: 'Пользователь не найден' });
        }

        // Вставляем новый комментарий в базу данных
        const result = await pool.query(
            'INSERT INTO comments (rate, description, plus, minus, buy_method, price, product_id, user_id, author) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [rate, description, plus, minus, buy_method, price, id, user_id, author]
        );

        const newComment = result.rows[0];

        // 1. Подсчитываем средний рейтинг всех комментариев для данного товара
        const avgResult = await pool.query(
            'SELECT AVG(rate) as average_rating FROM comments WHERE product_id = $1',
            [id]
        );
        const averageRating = avgResult.rows[0]?.average_rating || 0;

        // 2. Обновляем столбец comm_count в таблице products
        await pool.query(
            'UPDATE products SET comm_count = comm_count + 1 WHERE id = $1',
            [id]
        );
        // 3. Обновляем столбец average_rating в таблице products
        await pool.query(
            'UPDATE products SET average_rating = $1 WHERE id = $2',
            [averageRating, id]
        );


        // Возвращаем успешный ответ с данными комментария
        res.status(201).json({
            comment: {
                id: newComment.id,
                rate: newComment.rate,
                description: newComment.description,
                plus: newComment.plus,
                minus: newComment.minus,
                buy_method: newComment.buy_method,
                price: newComment.price,
                product_id: newComment.product_id,
                user_id: newComment.user_id,
                author: newComment.author,
            },
        });
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
}
