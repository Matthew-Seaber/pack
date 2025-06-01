import Link from "next/link";
import Image from "next/image";

function Logo() {
  return (
    <>
      <Link href="/">
        <span className="block w-8 h-8">
          <Image
            src="/logo-dark.svg"
            alt="Logo, press to go home"
            width={24}
            height={24}
            className="hidden dark:block w-full h-full object-contain"
            style={{ display: "block" }}
          />
        </span>
      </Link>
    </>
  );
}

export default Logo;
