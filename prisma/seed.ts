import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

//这里写Prisma.PostCreateInput[],是因为prisma会自动生成类，直接使用prisma生成的类，可以避免类型错误，同时有代码提示
const initialPosts : Prisma.PostCreateInput[] = [
    {
        title: 'First Post',
        slug:'first-post',
        content: 'This is the first post',
        published: true,
        author:{
            connectOrCreate:{
                where:{
                    email:'fanzejiea@gmial.com'
                },
                create:{
                    email:'fanzejiea@gmail.com',
                    hashedPassword:"xsdfsafs2dcsa2gt3ksjf123fsaf2",
                }
            }
        }
    }
]
async function main() {
 console.log('Start seeding ...')
 for(const post of initialPosts){
    const newPost = await prisma.post.create({data:post})
    console.log(`Created post with id: ${newPost.id}`)
 }
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })