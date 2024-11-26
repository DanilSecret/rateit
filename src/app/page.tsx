import Image from "next/image";
import {Header} from "@/app/components/header";
import Link from "next/link";

export default function Home() {
  return (
      <div>
        <Header/>
        <Link href="/createProduct/" className="flex justify-center items-center bg-green-600 text-white py-1 px-2 rounded-lg hover:bg-green-700 w-[130px] m-5">Создать товар</Link>
      </div>
  );
}
