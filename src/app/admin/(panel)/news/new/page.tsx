import { PageHeader } from "@/components/admin/page-header";
import { PostForm } from "../form";

export default function NewPost() {
  return (
    <div>
      <PageHeader title="Нова публикация" />
      <PostForm />
    </div>
  );
}
