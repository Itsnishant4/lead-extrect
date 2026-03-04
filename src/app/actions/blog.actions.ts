'use server';

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { AdminService } from '@/services/admin.service';
import { BlogService } from '@/services/blog.service';
import { createBlogPostSchema, updateBlogPostSchema } from '@/lib/validations';
import { handleActionError } from './helpers';

export async function getAllBlogPostsAdminAction() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const data = await BlogService.getAllPostsAdmin();
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function createBlogPostAction(data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const validated = createBlogPostSchema.parse(data);
    const id = await BlogService.createPost(validated);
    revalidatePath('/blog');
    if (validated.slug) revalidatePath(`/blog/${validated.slug}`);
    return { success: true, id };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function updateBlogPostAction(id: number, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    const validated = updateBlogPostSchema.parse(data);
    await BlogService.updatePost(id, validated);
    revalidatePath('/blog');
    if (validated.slug) revalidatePath(`/blog/${validated.slug}`);
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function deleteBlogPostAction(id: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  try {
    await AdminService.checkAdmin(session.id);
    await BlogService.deletePost(id);
    revalidatePath('/blog');
    return { success: true };
  } catch (error: any) {
    return handleActionError(error);
  }
}

export async function getBlogPostsPublicAction() {
  try {
    const data = await BlogService.getPostsPublic();
    return { success: true, data };
  } catch (error: any) {
    console.error('[ACTIONS] getBlogPostsPublicAction error:', error);
    return handleActionError(error);
  }
}

export async function getBlogPostBySlugPublicAction(slug: string) {
  try {
    const data = await BlogService.getPostBySlugPublic(slug);
    if (!data) return { success: false, error: 'Post not found' };
    return { success: true, data };
  } catch (error: any) {
    return handleActionError(error);
  }
}
