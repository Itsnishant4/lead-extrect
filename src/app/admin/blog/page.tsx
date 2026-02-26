"use client"

import { useState } from "react"
import {
  getAllBlogPostsAdminAction,
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction
} from "@/app/actions"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Plus, 
  PencilSimple, 
  Trash, 
  Eye, 
  CheckCircle, 
  XCircle,
  Tag,
  Link as LinkIcon
} from "phosphor-react"
import { LoaderCircle, Search } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { slugify } from "@/lib/utils"

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const { open } = useSidebar();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const res = await getAllBlogPostsAdminAction();
      if (!res.success) throw new Error((res as any).error);
      return (res as any).data || [];
    }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    author: "LeadSpotter Team",
    category: "General",
    read_time: "5 min read",
    image_url: "",
    meta_title: "",
    meta_description: "",
    is_published: false
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      content: "",
      author: "LeadSpotter Team",
      category: "General",
      read_time: "5 min read",
      image_url: "",
      meta_title: "",
      meta_description: "",
      is_published: false
    });
    setEditingPost(null);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title || "",
      slug: post.slug || "",
      description: post.description || "",
      content: post.content || "",
      author: post.author || "LeadSpotter Team",
      category: post.category || "General",
      read_time: post.readTime || "5 min read",
      image_url: post.imageUrl || "",
      meta_title: post.metaTitle || "",
      meta_description: post.metaDescription || "",
      is_published: post.isPublished || false
    });
    setIsDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createBlogPostAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Blog post created");
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error((res as any).error || "Failed to create post");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateBlogPostAction(id, data),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Blog post updated");
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
        setIsDialogOpen(false);
        resetForm();
      } else {
        toast.error((res as any).error || "Failed to update post");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlogPostAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Blog post deleted");
        queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
        setIsDialogOpen(false);
      } else {
        toast.error((res as any).error || "Failed to delete post");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredPosts = posts.filter((post: any) => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className={`flex transition-all ease-in-out duration-300 ${open ? 'md:ml-[250px]' : 'md:ml-[60px]'} h-16 shrink-0 items-center justify-between gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b`}>
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Blog Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button size="sm" className="gap-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus size={16} />
          New Post
        </Button>
      </header>

      <main className={`flex-1 overflow-y-auto p-4 md:p-8 pt-6 ${open ? 'md:ml-[250px]' : 'md:ml-[30px]'}`}>
        {isLoading ? (
          <div className="flex h-[80vh] items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="w-full space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
              <p className="text-muted-foreground mt-1">
                Create, edit and manage blog posts for LeadSpotter.
              </p>
            </div>

            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Posts</CardTitle>
                    <CardDescription>Manage your content strategy.</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post: any) => (
                      <TableRow key={post.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="truncate max-w-[280px]">{post.title}</span>
                            <span className="text-xs text-muted-foreground font-normal truncate max-w-[280px]">/{post.slug}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Tag size={12} />
                            {post.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {post.isPublished ? (
                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                              <CheckCircle size={12} />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle size={12} />
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {post.author?.charAt(0)}
                            </div>
                            {post.author}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`/blog/${post.slug}`} target="_blank">
                                <Eye size={16} />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(post)}>
                              <PencilSimple size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this post?")) {
                                  deleteMutation.mutate(post.id);
                                }
                              }}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPosts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-[400px] text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center border border-dashed border-slate-300">
                              <FileText size={32} className="text-muted-foreground/40" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-lg font-bold text-foreground">No articles found</p>
                              <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                Start your content engine by creating your first blog post.
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="mt-2" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                              <Plus className="mr-2 h-4 w-4" /> Create First Post
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[92vh] overflow-y-auto flex flex-col p-3 border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 bg-muted/20">
            <DialogTitle className="text-2xl font-bold">{editingPost ? "Edit Blog Post" : "Create New Post"}</DialogTitle>
            <DialogDescription>
              Draft and publish content for LeadSpotter.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1  flex flex-col">
            <ScrollArea className="flex-1 px-6 py-4 ">
              <div className="space-y-6 pb-6">
                {/* Primary Info Section */}
                <div className="space-y-4 p-2">
                  <div className="grid gap-4 p-2 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Title</Label>
                      <Input 
                        id="title" 
                        required 
                        value={formData.title} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({ 
                            ...prev, 
                            title: val,
                            slug: editingPost ? prev.slug : slugify(val)
                          }));
                        }}
                        className="bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500"
                        placeholder="e.g. 10 Lead Generation Tips"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
                        Slug
                        <Button 
                          type="button" 
                          variant="ghost" 
                          className="h-4 text-[10px] uppercase font-bold text-indigo-600 hover:text-indigo-700 p-0"
                          onClick={() => setFormData(prev => ({ ...prev, slug: slugify(formData.title) }))}
                        >
                          Auto-generate
                        </Button>
                      </Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                          id="slug" 
                          required 
                          value={formData.slug} 
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          className="pl-10 bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500"
                          placeholder="my-cool-post"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400">Excerpt (Short Description)</Label>
                    <Textarea 
                      id="description" 
                      value={formData.description} 
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief summary for the blog card..."
                      className="h-20 bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-xs font-black uppercase tracking-widest text-slate-400">Content (Markdown)</Label>
                    <Textarea 
                      id="content" 
                      required
                      value={formData.content} 
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your article here..."
                      className="min-h-[250px] font-mono text-sm leading-relaxed bg-muted/5 border-none shadow-sm focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Metadata Section */}
                <div className="grid px-6 gap-4 md:grid-cols-3 p-4 bg-muted/10 rounded-2xl">
                  <div className="space-y-1.5">
                    <Label htmlFor="author" className="text-[10px] font-black uppercase text-slate-400">Author</Label>
                    <Input id="author" value={formData.author} onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))} className="h-8 text-xs bg-background border-none shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-[10px] font-black uppercase text-slate-400">Category</Label>
                    <Input id="category" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="h-8 text-xs bg-background border-none shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="read_time" className="text-[10px] font-black uppercase text-slate-400">Read Time</Label>
                    <Input id="read_time" value={formData.read_time} onChange={(e) => setFormData(prev => ({ ...prev, read_time: e.target.value }))} className="h-8 text-xs bg-background border-none shadow-sm" />
                  </div>
                </div>

                {/* SEO Settings Section */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                      <FileText size={18} weight="bold" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">SEO Optimization</h4>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="meta_title" className="text-[10px] font-black uppercase text-slate-400">Meta Title</Label>
                      <Input id="meta_title" value={formData.meta_title} onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))} placeholder="Optional title for Google" className="bg-muted/5 border-none shadow-sm h-9 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url" className="text-[10px] font-black uppercase text-slate-400">Featured Image URL</Label>
                      <Input id="image_url" value={formData.image_url} onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." className="bg-muted/5 border-none shadow-sm h-9 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_description" className="text-[10px] font-black uppercase text-slate-400">Meta Description</Label>
                    <Textarea id="meta_description" value={formData.meta_description} onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))} placeholder="Optional description for Google" className="h-20 bg-muted/5 border-none shadow-sm text-sm resize-none" />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-indigo-600/5 rounded-2xl border border-indigo-600/10">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-indigo-900 uppercase tracking-tight">Visibility Status</Label>
                    <p className="text-[10px] font-medium text-indigo-600/60 uppercase">
                      {formData.is_published ? "Live on website" : "Draft (Hidden from public)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[10px] font-black tracking-widest", formData.is_published ? "text-indigo-600" : "text-slate-400")}>
                      {formData.is_published ? "PUBLISHED" : "DRAFT"}
                    </span>
                    <Switch 
                      checked={formData.is_published} 
                      onCheckedChange={(val) => setFormData(prev => ({ ...prev, is_published: val }))} 
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter className="p-6 pt-3 border-t bg-muted/10">
              <Button type="button" variant="ghost" className="font-bold text-xs uppercase tracking-widest" onClick={() => setIsDialogOpen(false)}>Discard</Button>
              <Button type="submit" className="px-8 font-bold text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {editingPost ? "Save Changes" : "Create Post"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
