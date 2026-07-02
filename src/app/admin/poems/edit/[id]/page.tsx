import PoemForm from '@/components/PoemForm';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPoemPage({ params }: PageProps) {
  const { id } = await params;
  return <PoemForm poemId={id} />;
}
