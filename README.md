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
## 修改schema.prisma

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

输入两次y，就是确定会删掉数据库里原来的数
要是没变化就关停studio重启下

## 查询单条数据

findUnique()需要保证where条件唯一，否则会报错
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
如果我们想使用slug作为params查询，就要修改表结构
```
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String?
  published Boolean  @default(false)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}
```
同时修改监听的参数，也就是[id] => [slug]

```
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
```
如果报错可以重启下dev

## 添加索引

如果我们想给某个字段加索引以让根据这个字段进行搜索的查询变的更快，我们需要

```
model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String?
  published Boolean  @default(false)
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
  @@index(slug)
}

```

## 重命名

```
createdAt DateTime @default(now()) @map("created_at")
``` 

## 条件查询多条

```
const posts = await prisma.post.findMany({
    where:{
        published: true
    }
})
```
## 查询排序

```
const posts = await prisma.post.findMany({
    where:{
        published: true
    },
    orderBy:{
        createdAt: "desc"
    }
})

```

## 只查询某些字段

```
const posts = await prisma.post.findMany({
    where:{
        published: true
    },
    select:{
        title: true,
        slug: true,
        content: true
    }
})
```

## 查询分页

```
const posts = await prisma.post.findMany({
    where:{
        published: true
    },
    select:{
        title: true,
        slug: true,
        content: true
    },
    take: 1, //采用一个
    skip: 1 //跳过第一个
})
```
## 查询总数


```
const total = await prisma.post.count({
    where:{
        published: true
    }
})
```
# post

写一个表单
```
 <form className="flex flex-col gap-y-2 items-center justify-center mt-8 w-full" onSubmit={()=>{
                fetch("/api/post", {
                    method: "POST",
                    body: JSON.stringify({
                        title: event?.target.title.value,
                        content: event?.target.content.value,
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            }}>
                <input className="px-2 py-1 border border-black/10 rounded-md w-1/2" type="text" placeholder="Title" name="title"/> 
                <textarea className="px-2 py-1 border border-black/10 rounded-md w-1/2" placeholder="Content" name="content" rows={5}/>
                <button type="submit" className="px-2 py-1 border border-black/10 rounded-md">Create Post</button>
</form>
```
但是我们不建议在这里去写

创建一个/src/actions文件夹

创建一个actios.ts文件

```
"use server";

import prisma from "@/lib/db";

export async function createPosts(formData: FormData) {
    await prisma.post.create({
        data: {
            title: formData.get("title") as string,
            slug:(formData.get("title") as string).replace(/\s+/g, "-").toLowerCase(),
            content: formData.get("content") as string,
        }
    })

    revalidatePath("/posts"); //添加这个可以让页面发起请求后重新加载
}
```

在表单中调用这个函数  
```
<form className="flex flex-col gap-y-2 items-center justify-center mt-8 w-full" action={createPosts}>
                <input className="px-2 py-1 border border-black/10 rounded-md w-1/2" type="text" placeholder="Title" name="title"/> 
                <textarea className="px-2 py-1 border border-black/10 rounded-md w-1/2" placeholder="Content" name="content" rows={5}/>
                <button type="submit" className="px-2 py-1 border border-black/10 rounded-md">Create Post</button>
            </form>
```  
表单数据会被提交到/api/post

数据通过表单项中的name来关联


# relation

## one to many

```
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  hashedPassword String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  posts          Post[]
}

当我们写这个posts的时候会自动修改Post的model

model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author      User?    @relation(fields: [authorId], references: [id])
  authorId    String?

  @@index(slug)
}
```

## many to many

```
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  hashedPassword String
  posts          Post[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  authors User[]

  @@index(slug)
}
```

## one to one

```
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  hashedPassword String
  posts          Post?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String   @unique

  @@index(slug)
}
```

# 关联查询 include & connect
在我们查询时

直接这样

```
const user = await prisma.user.findUnique({
        where: {
            email: "fanzejiea@gmail.com"
        }
    })
```
是不能user.posts.length去使用的

要像这样去查询，就能正常获取到user.posts.length

```
const user = await prisma.user.findUnique({
        where: {
            email: "fanzejiea@gmail.com"
        },
        include: {
            posts: true
        }
    })
    console.log(user.posts.length)
```

当我们插入时也需要

```
export async function createPosts(formData: FormData) {
    await prisma.post.create({
        data: {
            title: formData.get("title") as string,
            slug:(formData.get("title") as string).replace(/\s+/g, "-").toLowerCase(),
            content: formData.get("content") as string,
            author: {
                connect: {
                    email: "fanzejiea@gmail.com"
                }
            }
        }
    });

    revalidatePath("/posts");
}
```


# seed database
参考这个

https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding#seeding-your-database-with-typescript-or-javascript

在prisma下新建seed.ts,内容见文件

将这段代码贴进package.json
```
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
},
```

然后需要确保ts-node环境

```
npm i ts-node -D
```

然后运行
```
npx prisma db seed
```

# error handle

```
export async function createPosts(formData: FormData) {
    try {
        await prisma.post.create({
            data: {
                title: formData.get("title") as string,
                slug:(formData.get("title") as string).replace(/\s+/g, "-").toLowerCase(),
                content: formData.get("content") as string,
                author: {
                    connect: {
                        email: "fanzejiea@gmail.com"
                    }
                }
            }
        });
        
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a try-catch block to handle different types of errors
            if (error.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation, a new user cannot be created with this email'
                )
            }
        }
    }
    revalidatePath("/posts");
}
```

# cache
有点类似于广告，而且据他说是个比较复杂的事情，一笔带过了

# going to production

