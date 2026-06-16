"use client";

import { useEffect, useState } from "react";
import { emailParts } from "@/lib/content";

export default function EmailLink() {
  const [href, setHref] = useState("#");

  useEffect(() => {
    setHref(`mailto:${emailParts.join("@")}`);
  }, []);

  return (
    <a className="btn" href={href}>
      Email ↗
    </a>
  );
}
