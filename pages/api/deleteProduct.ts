'use server';

import pool from "@/lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function deleteProduct(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id } = req.query;  // Получаем ID товара из query-параметров

        if (!id) {
            return res.status(400).json({ error: 'ID товара отсутствует' });
        }

        try {
            // Выполняем запрос к базе данных для удаления товара
            const result = await pool.query(
                'DELETE FROM products WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Товар не найден' });
            }

            console.log('Товар удален:', result.rows[0]);
            return res.status(200).json({ message: 'Товар успешно удален', product: result.rows[0] });
        } catch (error) {
            console.error('Ошибка при удалении товара:', error);
            return res.status(500).json({ error: 'Не удалось удалить товар' });
        }
    } else {
        console.error('Метод не поддерживается');
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }
}
