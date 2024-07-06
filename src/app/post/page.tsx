import { createPosts } from "@/actions/actions"
import prisma from "@/lib/db"
import Link from "next/link"

export default async function PostsPage() {
    const user = await prisma.user.findUnique({
        where: {
            email: "fanzejiea@gmail.com"
        }
    })

    const posts = await prisma.post.findMany({
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
        <main className="flex flex-col items-center justify-center min-h-screen p-24 w-full">
            <h1 className="text-5xl font-bold mb-8">Posts({total})</h1>
            <ul className=" border-t border-b border-black/10 py-5 space-y-4 leading-8">
               {posts.map((post) => (
                    <li key={post.id} className="flex items-center justify-between px-5">
                        <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    </li>
               ))}
            </ul>

            <form className="flex flex-col gap-y-2 items-center justify-center mt-8 w-full" action={createPosts}>
                <input className="px-2 py-1 border border-black/10 rounded-md w-1/2" type="text" placeholder="Title" name="title"/> 
                <textarea className="px-2 py-1 border border-black/10 rounded-md w-1/2" placeholder="Content" name="content" rows={5}/>
                <button type="submit" className="px-2 py-1 border border-black/10 rounded-md">Create Post</button>
            </form>
        </main>
    )
}