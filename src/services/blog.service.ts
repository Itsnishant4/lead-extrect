import { db } from '@/lib/db/index';
import { blogPosts } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { AuditService } from './audit.service';

export class BlogService {
  static async getAllPostsAdmin() {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  static async createPost(data: any) {
    const result = await db.insert(blogPosts).values({
      slug: data.slug,
      title: data.title,
      description: data.description,
      content: data.content,
      author: data.author || 'LeadSpotter Team',
      category: data.category || 'General',
      readTime: data.read_time,
      imageUrl: data.image_url,
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
      isPublished: data.is_published,
      publishedAt: data.is_published ? new Date() : null,
    }).returning({ id: blogPosts.id });

    await AuditService.logAction('blog_post_created', 'success', { slug: data.slug });
    return result[0].id;
  }

  static async updatePost(id: number, data: any) {
    await db.update(blogPosts).set({
      slug: data.slug,
      title: data.title,
      description: data.description,
      content: data.content,
      author: data.author,
      category: data.category,
      readTime: data.read_time,
      imageUrl: data.image_url,
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
      isPublished: data.is_published,
      publishedAt: data.is_published ? (data.published_at ? new Date(data.published_at) : new Date()) : null,
      updatedAt: new Date(),
    }).where(eq(blogPosts.id, id));

    await AuditService.logAction('blog_post_updated', 'success', { id, slug: data.slug });
  }

  static async deletePost(id: number) {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    await AuditService.logAction('blog_post_deleted', 'success', { id });
  }

  static async getPostsPublic() {
    return await db.select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      description: blogPosts.description,
      author: blogPosts.author,
      category: blogPosts.category,
      readTime: blogPosts.readTime,
      imageUrl: blogPosts.imageUrl,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt));
  }

  static async getPostBySlugPublic(slug: string) {
    const posts = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true))).limit(1);
    if (posts.length === 0) return null;
    return posts[0];
  }
}
