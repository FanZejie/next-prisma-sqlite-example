import prisma from "@/lib/db"
import Link from "next/link"

export default async function PostsPage() {
    const posts = await prisma.post.findMany({
        where: {
            published: true
        },
        select: {
            id: true,
            title: true,
            slug: true
        },
    })
    const total = await prisma.post.count({
        where:{
            published: true
        }
    })
    return(
        <main className="flex flex-col items-center justify-center min-h-screen p-24">
            <h1 className="text-5xl font-bold mb-8">Posts({total})</h1>
            <ul className=" border-t border-b border-black/10 py-5 space-y-4 leading-8">
               {posts.map((post) => (
                    <li key={post.id} className="flex items-center justify-between px-5">
                        <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    </li>
               ))}
            </ul>
        </main>
    )
}