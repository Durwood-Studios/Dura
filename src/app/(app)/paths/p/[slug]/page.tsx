import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PathDetail } from "@/components/paths/PathDetail";
import { getPathBySlug, PATHS } from "@/lib/paths";

export function generateStaticParams(): Array<{ slug: string }> {
  return PATHS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) {
    return { title: "Path not found · DURA" };
  }
  return {
    title: `${path.title} · DURA Paths`,
    description: path.description,
  };
}

export default async function PathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.ReactElement> {
  const { slug } = await params;
  const path = getPathBySlug(slug);
  if (!path) {
    notFound();
  }
  return <PathDetail path={path} />;
}
