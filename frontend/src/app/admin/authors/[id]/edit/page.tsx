import YonetimKabugu from "@/components/yonetim/YonetimKabugu";
import YazarFormu from "@/components/yonetim/YazarFormu";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAuthorPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <YonetimKabugu>
      <YazarFormu id={id} />
    </YonetimKabugu>
  );
}
