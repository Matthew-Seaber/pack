import { redirect } from "next/navigation";

interface RedirectToSchoolworkProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RedirectToSchoolwork({ params }: RedirectToSchoolworkProps) {
  const { id } = await params;
  redirect(`/classes/${id}/schoolwork`);
}
