// src/pages/index.jsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");  // يحولك للصفحة /home
  }, [router]);

  return <p>جاري التحويل...</p>;
}
