'use server';

import pool from "@/lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getProduct(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { id } = req.query; // Получаем ID товара из query-параметров

        if (!id) {
            return res.status(400).json({ error: 'ID товара отсутствует' });
        }

        try {
            // Выполняем запрос к базе данных
            const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            console.log('Товар найден:', result.rows[0]);
            return res.status(200).json({ product: result.rows[0] });
        } catch (error) {
            console.error('Ошибка при запросе товара:', error);
            return res.status(500).json({ error: 'Не удалось получить данные о товаре' });
        }
    } else {
        console.error('Метод не поддерживается');
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }
}
