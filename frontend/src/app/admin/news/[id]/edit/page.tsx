import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import HaberFormu from "@/components/yonetim/HaberFormu";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <YonetimKabugu>
      <HaberFormu id={id} />
    </YonetimKabugu>
  );
}
