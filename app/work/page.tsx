import { WORK_HTML } from '@/data/html-work';

export const metadata = {
  title: "ARXENOVA | Our Client's Success Stories",
  description: "Explore ARXENOVA's portfolio of brand strategy, visual identity, and website projects.",
};

export default function WorkPage() {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: WORK_HTML }}
      suppressHydrationWarning
    />
  );
}
