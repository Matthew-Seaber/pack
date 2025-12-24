function SupportPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Support Page</h2>
      <div>
        This page isn&apos;t ready yet. In the meantime, feel free to email any
        questions or concerns to{" "}
        <a
          href="mailto:support@packapp.co.uk"
          className="text-blue-600 underline"
        >
          support@packapp.co.uk
        </a>
        .
      </div>

      <h3 className="mt-10 text-lg font-medium underline">
        List of supported subjects (for students)
      </h3>
      <h4 className="mt-2">A level:</h4>
      <ul className="list-disc list-inside mb-4">
        <li>OCR Computer Science</li>
      </ul>
      <h4 className="mt-2">GCSE:</h4>
      <ul className="list-disc list-inside mb-4">
        <p className="italic text-muted-foreground">There are currently no supported subjects at GCSE level.</p>
      </ul>
    </>
  );
}

export default SupportPage;
