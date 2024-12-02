"use client"
import Image from "next/image";
import {useEffect, useState} from 'react';
import {useParams} from "next/navigation";
import {Header} from "@/app/components/header";
import Link from "next/link";
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

interface Comment {
    id: number;
    rate: number;
    description: string;
    plus?: string;
    minus?: string;
    buy_method?: string;
    price?: string;
    product_id: number;
    author: string;
    user_id: string;
}

export default function ProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [cookies] = useCookies(["auth_token"]);
    const [currUser, setCurrUser] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (!params) return;

        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/getOneProd?id=${params?.id}`);
                const result = await response.json();
                if (response.ok && result.product) {
                    setProduct(result.product);
                } else {
                    console.error("Ошибка получения данных о товаре");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        const checkUser = async () => {
            try {

                const response = await fetch(`/api/getUserInf?cookie=${cookies}`, { method: "GET" });
                const result = await response.json();

                if (response.ok) {
                    setIsAuth(true);
                    setCurrUser(result.userData);
                } else {
                    console.error("Ошибка получения данных");
                    setIsAuth(false);
                }
            } catch (error) {
                console.error("Ошибка при отправке данных:", error);
                setIsAuth(false);
            }
        };


        const fetchComments = async () => {
            try {
                const response = await fetch(`/api/getAllComments?id=${params?.id}`);
                const result = await response.json();
                if (response.ok && Array.isArray(result.comments)) {
                    setComments(result.comments);
                } else {
                    setComments([]); // Если данные некорректны, устанавливаем пустой массив
                    console.error("Ошибка получения комментариев");
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchProduct();
        fetchComments();
        checkUser();
    }, [params?.id]);


    if (isLoading) {
        return <div className="text-center text-lg font-bold mt-10">Загрузка...</div>;
    }

    if (!product) {
        return <div className="text-center text-lg font-bold mt-10">Товар не найден</div>;
    }

    const deleteComment = async (commentId: number, productId: number) => {
        if (!confirm("Вы уверены, что хотите удалить этот комментарий?")) return;

        try {
            const response = await fetch(`/api/deleteComment?id=${commentId}&productId=${productId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${cookies.auth_token}`,
                },
            });

            if (response.ok) {
                alert("Комментарий успешно удален.");
                window.location.reload(); // Обновление страницы
            } else {
                console.error("Ошибка при удалении комментария");
            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };


    return (
        <div>
            <Header/>
            <div className="max-w-4xl mx-auto px-4 py-8">

                <div className="flex flex-col md:flex-row items-center bg-white shadow-md rounded-lg overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full md:w-1/2 h-80 object-cover"
                    />
                    <div className="w-full md:w-1/2 p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
                        <p className="text-gray-600 text-sm mb-4">Производитель: <span
                            className="text-gray-800">{product.company}</span></p>
                        <p className="text-gray-600 text-sm mb-4">
                            Рейтинг:{" "}<span
                            className="text-yellow-500 font-bold">{parseFloat(product.average_rating).toFixed(1)}</span>{" "}⭐
                        </p>

                        <p className="text-gray-600 text-sm mb-4">
                            Отзывы: <span className="font-semibold">{product.comm_count}</span>
                        </p>
                        <p className="text-gray-600 mb-6">{product.description}</p>
                    </div>
                </div>
                {isAuth ? (
                <Link
                    href={`/products/${product.id}/add_comment/`}
                    className="w-[180px] bg-indigo-600 text-white py-1 px-2 rounded-lg flex justify-center gap-2 hover:bg-indigo-700 my-2"
                >
                    Написать отзыв
                    <Image src="/hand.svg" width={25} height={25} alt=""/>
                </Link>
                ) : (
                    <></>
                )}

                <div className="bg-white p-4 rounded-lg shadow mt-6">
                    <h2 className="text-xl font-bold mb-4">Отзывы</h2>
                    {Array.isArray(comments) && comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="border-b py-4">
                                <h2>Автор: {comment.author}</h2>
                                <p className="text-sm text-gray-600">Оценка: {comment.rate} ⭐</p>
                                <p className="text-gray-800">Комментарий: {comment.description}</p>
                                {comment.plus && <p className="text-green-600">Плюсы: {comment.plus}</p>}
                                {comment.minus && <p className="text-red-600">Минусы: {comment.minus}</p>}
                                {comment.buy_method && (
                                    <p className="text-gray-600">Способ покупки: {comment.buy_method}</p>
                                )}
                                {comment.price && <p className="text-gray-600">Цена: {comment.price}</p>}

                                {(comment.author === currUser.username || currUser.role === 'admin') && (
                                    <button
                                        onClick={() => deleteComment(comment.id, product.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Удалить
                                    </button>

                                )}

                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600">Пока отзывов нет. Будьте первым!</p>
                    )}
                </div>

            </div>
        </div>

    );
}
