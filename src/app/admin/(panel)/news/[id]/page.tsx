import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, posts } from "@/db";
import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "../form";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, Number(id))).limit(1);
  if (!post) notFound();
  return (
    <div>
      <PageHeader title={post.title} intro={`Публичен адрес: /novini/${post.slug}`} />
      <PostForm post={post} />
    </div>
  );
}
