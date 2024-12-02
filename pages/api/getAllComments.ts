"use server";

import pool from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getAllComments(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Метод не поддерживается" });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "ID товара отсутствует" });
    }

    try {
        const result = await pool.query("SELECT * FROM comments WHERE product_id = $1", [id]);

        // Проверяем, есть ли данные
        if (result.rowCount === 0) {
            return res.status(200).json({ comments: [] });
        }

        // Возвращаем результат с корректным ключом
        return res.status(200).json({ comments: result.rows });
    } catch (error) {
        console.error("Ошибка получения комментариев:", error);
        return res.status(500).json({ error: "Ошибка получения данных из базы" });
    }
}
