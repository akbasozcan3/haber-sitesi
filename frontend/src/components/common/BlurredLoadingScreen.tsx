import LottieLoader from "@/components/common/LottieLoader";

export default function BlurredLoadingScreen({ size = 130 }: { size?: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/65 backdrop-blur-md transition-all duration-300 select-none">
      <LottieLoader size={size} />
    </div>
  );
}
