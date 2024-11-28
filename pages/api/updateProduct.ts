'use server';

import pool from "@/lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function updateProduct(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { id } = req.query;  // Получаем ID товара из query-параметров
        const { name, description, company, image} = req.body;  // Получаем данные товара из тела запроса

        if (!id || !name || !description || !company || !image) {
            return res.status(400).json({ error: 'Все поля обязаны быть заполнены' });
        }

        try {
            // Выполняем запрос к базе данных для обновления товара
            const result = await pool.query(
                `UPDATE products 
                 SET name = $1, description = $2, company = $3, image = $4 
                 WHERE id = $5 
                 RETURNING *`,
                [name, description, company, image, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            console.log('Товар обновлен:', result.rows[0]);
            return res.status(200).json({ product: result.rows[0] });
        } catch (error) {
            console.error('Ошибка при обновлении товара:', error);
            return res.status(500).json({ error: 'Не удалось обновить товар' });
        }
    } else {
        console.error('Метод не поддерживается');
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }
}
