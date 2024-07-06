import prisma from "@/lib/db"
export default async function PostPage({params}) {

    const post = await prisma.post.findUnique({
        where:{
            slug: params.slug
        }
    })
    return(
        <main className=" flex flex-col items-center text-center  pt-24">
            <h1 className="text-3xl font-semibold">{post?.title}</h1>
            <p className="text-lg">{post?.content}</p>
        </main>
    )
}