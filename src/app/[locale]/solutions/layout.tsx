import SolutionHeader from "@/components/solutions/SolutionHeader";

export default function SolutionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SolutionHeader />
      {children}
    </>
  );
}
