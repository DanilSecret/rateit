"use client";
import Image from "next/image";
import { Header } from "@/app/components/header";
import Link from "next/link";
import { useState, useEffect } from "react";

interface Product {
    id: number;
    name: string;
    image: string;
    average_rating: string;
    company: string;
    comm_count: number;
    description: string;
}

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/getAllProd", {
                method: "GET",
            });

            const result = await response.json();

            if (response.ok) {
                setProducts(result.result);
            } else {
                console.error("Ошибка получения данных");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div>
            <Header />
            <Link
                href="/createProduct/"
                className="flex justify-center items-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 w-[130px] m-5"
            >
                Создать товар
            </Link>
            <div className="flex flex-wrap gap-4 p-5">
                {isLoading ? (
                    <p>Загрузка товаров...</p>
                ) : products.length > 0 ? (
                    products.map((product) => (
                        <Link
                            href={`/products/${product.id}`}
                            key={product.id}
                            className="border border-gray-300 rounded-lg p-4 shadow-md w-[300px]"
                        >
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={180}
                                    height={180}
                                    className="object-cover rounded-md"
                                />
                            ) : (
                                <div className="bg-gray-200 w-[200px] h-[200px] flex items-center justify-center rounded-md">
                                    <span className="text-gray-500">Нет изображения</span>
                                </div>
                            )}
                            <h3 className="text-lg font-bold mt-2">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                                {product.description.length > 100
                                    ? product.description.slice(0, 100) + "..."
                                    : product.description}
                            </p>
                            <p className="text-md text-gray-800">Компания: {product.company}</p>
                            <p className="text-md font-semibold mt-1">
                                Рейтинг: {product.average_rating}
                            </p>
                            <p className="text-sm text-gray-600">Комментарии: {product.comm_count}</p>
                        </Link>
                    ))
                ) : (
                    <p>Товары отсутствуют</p>
                )}
            </div>
        </div>
    );
}
