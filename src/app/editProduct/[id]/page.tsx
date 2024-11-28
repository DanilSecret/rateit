"use client";
import { useState, useEffect } from "react";
import {useParams, useRouter} from "next/navigation";
import { useCookies } from "react-cookie";

interface Product {
    id: number;
    name: string;
    image: string;
    average_rating: string;
    company: string;
    comm_count: number;
    description: string;
}

export default function EditProduct() {
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [cookies] = useCookies(["auth_token"]);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const response = await fetch("/api/getUserInf", {
                    method: "GET",
                    credentials: "include",
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

    const fetchProduct = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/getOneProd?id=${params?.id}`);
            const result = await response.json();

            if (response.ok) {
                setProduct(result.product);
            } else {
                console.error("Ошибка получения товара");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProduct = async (updatedProduct: Product) => {
        try {
            const response = await fetch(`/api/updateProduct?id=${params?.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cookies.auth_token}`,
                },
                body: JSON.stringify(updatedProduct),
            });

            if (response.ok) {
                alert("Товар успешно обновлен.");
                router.push("/");
            } else {
                console.error("Ошибка при обновлении товара");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, [params?.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (product) {
            updateProduct(product);
        }
    };

    if (isAdmin === null) {
        return <div>Проверка прав доступа...</div>; // Пока статус не определён
    }

    if (!isAdmin) {
        return null; // Не показываем ничего, если доступ запрещён
    }

    if (isLoading) return <p>Загрузка...</p>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md"
            >
                <h1 className="text-xl font-semibold text-center mb-4">Редактировать товар</h1>
                {product && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Название товара
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Описание
                            </label>
                            <textarea
                                name="description"
                                value={product.description}
                                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                                Компания
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={product.company}
                                onChange={(e) => setProduct({ ...product, company: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                Изображение
                            </label>
                            <input
                                type="text"
                                name="image"
                                value={product.image}
                                onChange={(e) => setProduct({ ...product, image: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Поле для отображения рейтинга (без возможности редактирования) */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Рейтинг</label>
                            <input
                                type="text"
                                value={product.average_rating}
                                readOnly
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-200"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                        >
                            Обновить товар
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
