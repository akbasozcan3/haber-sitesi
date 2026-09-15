import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import KategoriFormu from "@/components/yonetim/KategoriFormu";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <YonetimKabugu>
      <KategoriFormu id={id} />
    </YonetimKabugu>
  );
}
