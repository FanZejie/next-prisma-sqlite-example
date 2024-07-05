use this video

https://www.youtube.com/watch?v=QXxy8Uv1LnQ

初始化项目
```
npx create-next-app@latest
```

执行了如下命令：

```
npm install prisma --save-dev

npx prisma init --datasource-provider sqlite
```

先写一个model
```
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

执行命令：
```
npx prisma db push
```
在执行这个命令时会自动install prisma/client

按道理来讲会生成一个Post表，接下来去查看下

```
npx prisma studio
```

切到http://localhost:5555就是管理界面了
![](Next%20&%20Prisma.assets/image-20240705174739658.png)

写一个post界面

```jsx
export default async function PostsPage() {
    const posts = await Prisma.post.findMany()
    return(
        <main className=" flex flex-col items-center gap-y-5 pt-24 text-center">
            <h1 className="text-3xl font-semibold">Posts</h1>

            <ul className="border-t border-b border-black/10 py-5 leading-8">
                {posts.map((post) => (
                    <li key={post.id} className="flex items-center justify-between px-5">
                        <a className="text-blue-600">{post.title}</a>
                    </li>
                ))}
            </ul>

        </main>
    )
}
```
但这种方式博主也没有说该导入什么包，只是说这样会导致重复实例化，所以要使用官方推荐的最佳实践

https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

在src下创建目录lib,再/src/lib下创建文件db.ts
拷贝链接中内容
```ts
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
```
有了这个就不会一遍遍的实例化
在使用到这个prisma的地方导入
```js
import prisma from "@/lib/db"
export default async function PostsPage() {

    const posts = await prisma.post.findMany()
    return(
        <main className=" flex flex-col items-center gap-y-5 pt-24 text-center">
            <h1 className="text-3xl font-semibold">Posts</h1>

            <ul className="border-t border-b border-black/10 py-5 leading-8">
                {posts.map((post) => (
                    <li key={post.id} className="flex items-center justify-between px-5">
                        <a className="text-blue-600">{post.title}</a>
                    </li>
                ))}
            </ul>

        </main>
    )
}
```
此时访问http://localhost:3000/post
就能看到我们的文章列表了
![](Next%20&%20Prisma.assets/image-20240705175638500.png)


接下来新建@/app/posts/[id]/page.tsx

```tsx
import prisma from "@/lib/db"
export default async function PostPage({params}) {

    const post = await prisma.post.findUnique({
        where:{
            id: params.id
        }
    })
    return(
        <main className=" flex flex-col items-center gap-y-5 pt-24 text-center">
            <h1 className="text-3xl font-semibold">{post?.title}</h1>
            <p className="text-lg">{post?.content}</p>
        </main>
    )
}
```
可以查询单条

这里涉及到一个知识点，如果想更新schema该怎么办
比如我这会要修改id为 cuid，然后添加一列，用来当url标题

```
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String
  content   String?
  published Boolean  @default(false)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```

使用
```
npx prisma db push
```
![](Next%20&%20Prisma.assets/image-20240705182253832.png)
输入两次y，就是确定会删掉数据库里原来的数
要是没变化就关停studio重启下


