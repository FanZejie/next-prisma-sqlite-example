import prisma from "@/lib/db"
import Link from "next/link"

export default async function PostsPage() {
    const posts = await prisma.post.findMany()
    return(
        <main className="flex flex-col items-center justify-center min-h-screen p-24">
            <h1 className="text-5xl font-bold mb-8">Posts</h1>
            <ul className="space-y-4">
               {posts.map((post) => (
                    <li key={post.id} className="bg-gray-100 p-4 rounded-md">
                        <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    </li>
               ))}
            </ul>
        </main>
    )
}