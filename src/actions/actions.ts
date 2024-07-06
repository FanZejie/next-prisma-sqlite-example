"use server";

import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

export async function editPost(formData:FormData, id: string) {
    await prisma.post.update({
        where: {
            id: id
        },
        data: {
            title: formData.get("title") as string,
            slug:(formData.get("title") as string).replace(/\s+/g, "-").toLowerCase(),
            content: formData.get("content") as string,
        }
    })
}

export async function deletePost(id: string) {
    await prisma.post.delete({
        where: {
            id: id
        }
    })
}