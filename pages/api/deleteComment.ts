'use server';

import pool from "@/lib/db";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function deleteProduct(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const { id,productId } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'ID отсутствует' });
        }

        try {

            const result = await pool.query(
                'DELETE FROM comments WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Комментарий не найден' });
            }

            console.log('Комментарий удален:', result.rows[0]);

            // 1. Подсчитываем средний рейтинг всех комментариев для данного товара
            const avgResult = await pool.query(
                'SELECT AVG(rate) as average_rating FROM comments WHERE product_id = $1',
                [productId]
            );
            const averageRating = avgResult.rows[0]?.average_rating || 0;

            // 2. Обновляем столбец comm_count в таблице products
            await pool.query(
                'UPDATE products SET comm_count = comm_count - 1 WHERE id = $1',
                [productId]
            );
            // 3. Обновляем столбец average_rating в таблице products
            await pool.query(
                'UPDATE products SET average_rating = $1 WHERE id = $2',
                [averageRating, productId]
            );

            return res.status(200).json({ message: 'Комментарий успешно удален', product: result.rows[0] });
        } catch (error) {
            console.error('Ошибка при удалении комментарий:', error);
            return res.status(500).json({ error: 'Не удалось удалить комментарий' });
        }
    } else {
        console.error('Метод не поддерживается');
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }
}
