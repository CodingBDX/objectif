import { IC } from "@/lib/icons";
export default function Ic({ n, s = 20 }: { n: string; s?: number }) {
  return <svg className="ic" viewBox="0 0 24 24" width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: IC[n] || "" }} />;
}
