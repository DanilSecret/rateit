"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {useCookies} from "react-cookie";
import {Header} from "@/app/components/header";

interface CommentFormData {
    rate: number;
    description: string;
    plus?: string;
    minus?: string;
    buy_method?: string;
    price?: string;
    product_id: number;
}

export default function AddCommentForm() {
    const [formData, setFormData] = useState<CommentFormData>({
        rate: 0,
        description: "",
        plus: "",
        minus: "",
        buy_method: "",
        price: "",
        product_id: 0,
    });
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const params = useParams();
    const [isAuth, setIsAuth] = useState(false);
    const [cookies] = useCookies(["auth_token"]);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch(`/api/getUserInf?cookie=${cookies}`, { method: "GET" });
                const result = await response.json();

                if (response.ok) {
                    setIsAuth(true);
                } else {
                    console.error("Ошибка получения данных");
                    setIsAuth(false);
                    router.push("/");
                }
            } catch (error) {
                console.error("Ошибка проверки роли:", error);
                router.push("/");
            }
        };

        checkAdmin();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = (): boolean => {
        const validationErrors: { [key: string]: string } = {};

        if (formData.rate <= 0 || formData.rate > 5) validationErrors.rate = "Рейтинг должен быть от 1 до 5";
        if (!formData.description.trim()) validationErrors.description = "Описание обязательно";

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const payload = {data: formData, cookie: cookies}
        try {
            const response = await fetch(`/api/addComment?id=${params?.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage("Комментарий успешно добавлен!");
                router.push(`/products/${params?.id}`);
            } else {
                setMessage(result.message || "Ошибка при добавлении комментария");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
            setMessage("Ошибка соединения с сервером");
        }
    };

    if (!isAuth) {
        return null;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-xl font-semibold text-center mb-4">Добавить комментарий</h1>
                <div className="mb-4">
                    <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                        Рейтинг (1-5) <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="number"
                        name="rate"
                        min="1"
                        max="5"
                        value={formData.rate}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.rate && <p className="text-red-600 text-sm">{errors.rate}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Описание комментария <span className="text-red-600">*</span>
                    </label>
                    <textarea
                        name="description"
                        placeholder="Описание"
                        value={formData.description}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="plus" className="block text-sm font-medium text-gray-700">
                        Плюсы
                    </label>
                    <input
                        type="text"
                        name="plus"
                        value={formData.plus || ""}
                        placeholder="Плюсы"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="minus" className="block text-sm font-medium text-gray-700">
                        Минусы
                    </label>
                    <input
                        type="text"
                        name="minus"
                        value={formData.minus || ""}
                        placeholder="Минусы"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="buy_method" className="block text-sm font-medium text-gray-700">
                        Способ покупки
                    </label>
                    <input
                        type="text"
                        name="buy_method"
                        value={formData.buy_method || ""}
                        placeholder="Способ покупки"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                        Цена
                    </label>
                    <input
                        type="text"
                        name="price"
                        value={formData.price || ""}
                        placeholder="Цена"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                </div>
                <p className="my-2">Поля помеченные <span className="text-red-600">*</span> обязательны к заполнению</p>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                    Добавить комментарий
                </button>

                {message && <p className="w-full text-center text-red-600 mt-4">{message}</p>}
            </form>
        </div>
    );
}
