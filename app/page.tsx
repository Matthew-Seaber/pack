import Image from "next/image";

function HomePage() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center min-h-[75vh]">
        <div className="order-1 lg:order-none">
          <h1 className="text-4xl font-semibold">The Future of</h1>
          <h1 className="text-4xl font-semibold mt-3">Education is Here</h1>
          <p className="text-sm mt-3" style={{ color: "#7D7D7D" }}>
            Level up your learning today, and boost your exam grades to new
            heights! 🚀
          </p>
        </div>
        <div className="lg:col-span-2 flex flex-col lg:flex-row justify-between gap-7 order-1 lg:order-none">
          <div className="relative w-full max-w-4xl aspect-[16/10]">
            <Image
              src="/images/Macbook Mockup - Calendar.png"
              alt="Screenshot of the calendar page on a Macbook"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 700px"
            />
          </div>
          <div className="relative w-full max-w-48 aspect-[9/19] mx-auto lg:mx-0">
            <Image
              src="/images/iPhone Mockup - Calendar.png"
              alt="Screenshot of the calendar page on an iPhone"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 40vw, 160px"
            />
          </div>
        </div>
      </div>
      <div className="w-full flex justify-center fixed bottom-[15px] left-0">
        <p className="text-xs font-medium text-[#B4B4B4]">
          By accessing this website, you agree to our{" "}
          <a
        href="/terms"
        className="underline"
        target="_blank"
        rel="noopener noreferrer"
          >
        Terms
          </a>{" "}
          and{" "}
          <a
        href="/privacy"
        className="underline"
        target="_blank"
        rel="noopener noreferrer"
          >
        Privacy Policy
          </a>
          .
        </p>
      </div>
    </>
  );
}

export default HomePage;
