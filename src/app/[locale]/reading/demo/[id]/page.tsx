import DemoResultClient from "@/components/saju/demo/DemoResultClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "체험 분석 결과",
};

export default function DemoResultPage() {
  return <DemoResultClient />;
}
