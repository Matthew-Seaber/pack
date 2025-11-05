import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function Logo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Uses resolvedTheme instead of theme to respect system preferences
  const logoPath = mounted && resolvedTheme === "light" ? "/logo-light.svg" : "/logo-dark.svg";

  return (
    <Link href="/">
      <span className="block w-8 h-8">
        <Image
          src={logoPath}
          alt="Logo"
          width={24}
          height={24}
          className="w-full h-full object-contain"
          style={{ display: "block" }}
          key={logoPath}
        />
      </span>
    </Link>
  );
}

export default Logo;
