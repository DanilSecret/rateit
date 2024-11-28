"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProductFormData {
    name: string;
    image: string;
    company: string;
    description: string;
}

export default function AddProductForm() {
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        image: "",
        company: "",
        description: "",
    });
    const [message, setMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // Статус администратора
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch("/api/getUserInf", {
                    method: "GET",
                    credentials: "include", // Для отправки куки
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user information");
                }

                const data = await response.json();
                if (data.userRole === "admin") {
                    setIsAdmin(true); // Пользователь администратор
                } else {
                    setIsAdmin(false); // Пользователь не имеет доступа
                    router.push("/"); // Перенаправляем
                }
            } catch (error) {
                console.error("Ошибка проверки роли:", error);
                router.push("/"); // Перенаправляем в случае ошибки
            }
        };

        checkAdmin();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = (): boolean => {
        const validationErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) validationErrors.name = "Название обязательно";
        if (!formData.image.trim()) validationErrors.image = "Ссылка на изображение обязательна";
        if (!formData.company.trim()) validationErrors.company = "Компания обязательна";
        if (!formData.description.trim()) validationErrors.description = "Описание обязательно";

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const response = await fetch("/api/addProduct", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage("Товар успешно добавлен!");
                setFormData({ name: "", image: "", company: "", description: "" });
                router.push("/");
            } else {
                setMessage(result.message || "Ошибка при добавлении товара");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
            setMessage("Ошибка соединения с сервером");
        }
    };

    if (isAdmin === null) {
        return <div>Проверка прав доступа...</div>; // Пока статус не определён
    }

    if (!isAdmin) {
        return null; // Не показываем ничего, если доступ запрещён
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-xl font-semibold text-center mb-4">Добавить продукт</h1>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Название
                    </label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Название"
                        value={formData.name}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                        Ссылка на изображение
                    </label>
                    <input
                        type="text"
                        name="image"
                        placeholder="URL изображения"
                        value={formData.image}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.image && <p className="text-red-600 text-sm">{errors.image}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Компания
                    </label>
                    <input
                        type="text"
                        name="company"
                        placeholder="Компания"
                        value={formData.company}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.company && <p className="text-red-600 text-sm">{errors.company}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Описание товара
                    </label>
                    <input
                        type="text"
                        name="description"
                        placeholder="Описание товара"
                        value={formData.description}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={handleChange}
                    />
                    {errors.description && <p className="text-red-600 text-sm">{errors.description}</p>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                    Добавить продукт
                </button>

                {message && <p className="w-full text-center text-red-600 mt-4">{message}</p>}
            </form>
        </div>
    );
}
