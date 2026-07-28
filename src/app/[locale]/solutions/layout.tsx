import SolutionHeader from "@/components/solutions/SolutionHeader";
import SolutionRelated from "@/components/solutions/SolutionRelated";

export default function SolutionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SolutionHeader />
      {children}
      <SolutionRelated />
    </>
  );
}
