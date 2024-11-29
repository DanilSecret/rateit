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

export default function SearchPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/getAllProd", { method: "GET" });
            const result = await response.json();

            if (response.ok) {
                setProducts(result.result);
                setFilteredProducts(result.result);
            } else {
                console.error("Ошибка получения данных");
            }
        } catch (error) {
            console.error("Ошибка при отправке данных:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (searchQuery1: string) => {
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(searchQuery1) ||
            product.company.toLowerCase().includes(searchQuery1) ||
            product.description.toLowerCase().includes(searchQuery1)
        );
        setFilteredProducts(filtered);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div>
            <Header />
            <div className="p-5">
                <div className="flex gap-4 items-center mb-5">
                    <input
                        type="text"
                        placeholder="Поиск товаров..."
                        onChange={(e) => handleSearch(e.target.value)}
                        className="border border-gray-300 rounded-md px-4 py-2 w-full"
                    />
                </div>
                {isLoading ? (
                    <p>Загрузка товаров...</p>
                ) : filteredProducts.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="border border-gray-300 rounded-lg p-4 shadow-md w-[300px]"
                            >
                                <Link href={`/products/${product.id}`} className="block">
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
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Товары не найдены</p>
                )}
            </div>
        </div>
    );
}
