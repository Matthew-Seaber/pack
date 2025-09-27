"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff, Trash } from "lucide-react";
import Image from "next/image";
import { Toaster, toast } from "sonner";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [role, setRole] = useState("Student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [yearGroup, setYearGroup] = useState("Year 10");
  const [progressEmails, setProgressEmails] = useState("Enabled");
  const [subjects, setSubjects] = useState([""]);
  const [examBoards, setExamBoards] = useState([""]);

  const [title, setTitle] = useState("Mr");
  const [surname, setSurname] = useState("");
  const [subject, setSubject] = useState("Computer Science");
  const [classes, setClasses] = useState([""]);

  const router = useRouter();

  const commonPasswordList = [
    "password1!",
    "Password1!",
    "password123!",
    "Password123!",
    "Qwerty123!",
  ]; // Common passwords which meet all other password requirements
  const numberList = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]; // List of numbers passwords must contain
  const letterList = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ]; // List of letters passwords must contain
  const specialCharacters = ["!", "@", "#", "$", "%", "^", "&", "*"]; // List of special characters passwords must contain

  const addNewClass = () => {
    setClasses([...classes, ""]);
  };

  const updateClass = (index: number, value: string) => {
    const updatedClasses = [...classes];
    updatedClasses[index] = value;
    setClasses(updatedClasses);
  };

  const removeClass = (index: number) => {
    if (classes.length > 1) {
      const updatedClasses = classes.filter((_, i) => i !== index);
      setClasses(updatedClasses);
    }
  };

  const addNewSubject = () => {
    setSubjects([...subjects, ""]);
    setExamBoards([...examBoards, ""]);
  };

  const updateSubject = (index: number, value: string) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = value;
    setSubjects(updatedSubjects);
  };

  const updateExamBoard = (index: number, value: string) => {
    const updatedExamBoards = [...examBoards];
    updatedExamBoards[index] = value;
    setExamBoards(updatedExamBoards);
  };

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      const updatedSubjects = subjects.filter((_, i) => i !== index);
      const updatedExamBoards = examBoards.filter((_, i) => i !== index);
      setSubjects(updatedSubjects);
      setExamBoards(updatedExamBoards);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const containsNumber = numberList.some((num) => password.includes(num)); // Using "num" since "number" is reserved in TS
    const containsLetter = letterList.some((letter) =>
      password.toLowerCase().includes(letter)
    );
    const containsSpecialCharacter = specialCharacters.some((character) =>
      password.includes(character)
    );

    if (!firstName || !username || !email || !password) {
      // Validation for empty fields
      toast.error("Please fill in all fields.");
      return;
    } else if (username.length <= 5 || username.length >= 20) {
      // Validation for username length
      toast.error("Username must be at least 5 characters (20 max).");
      return;
    } else if (!email.includes("@") || !email.includes(".")) {
      // Validation for email type
      toast.error("Please enter a valid email address.");
      return;
    } else if (password.length < 8) {
      // Validation for password length
      toast.error("Password must be at least 8 characters long.");
      return;
    } else if (commonPasswordList.includes(password)) {
      // Validation for password strength #1
      toast.error("Your password is a common password.");
      return;
    } else if (password.includes(" ")) {
      // Validation for password strength #2
      toast.error("Password cannot contain spaces.");
      return;
    } else if (
      !containsNumber ||
      !containsLetter ||
      !containsSpecialCharacter
    ) {
      // Validation for password strength #3
      toast.error(
        "Password must contain a combination of letters, numbers, and special characters."
      );
      return;
    }

    if (currentStep === 1) {
      if (role === "Student") {
        setCurrentStep(2);
        return;
      } else if (role === "Teacher") {
        setCurrentStep(3);
        return;
      }
    } else {
      if (role === "Student") {
        if (
          !yearGroup ||
          !progressEmails ||
          subjects.length === 0 ||
          examBoards.length === 0
        ) {
          toast.error("Please fill in all fields.");
          return;
        }
      } else if (role === "Teacher") {
        if (
          !title ||
          !surname ||
          !subject ||
          classes.length === 0 ||
          classes.some((classItem) => classItem.trim() === "")
        ) {
          toast.error("Please fill in all fields.");
          return;
        }
      }

      try {
        toast.info("Validating...");

        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            role,
            username: username.trim(),
            email: email.trim(),
            password: password.trim(),
            yearGroup,
            progressEmails,
            title,
            surname: surname.trim(),
            subject,
            classes: classes.filter((cls) => cls.trim() !== ""),
            subjects: subjects.filter((sub) => sub.trim() !== ""),
            examBoards: examBoards.filter((board) => board.trim() !== ""),
          }),
        });
        if (res.ok) {
          toast.success(`Success! Redirecting you to the dashboard...`);
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          toast.error("Failed to create user. Please try again.");
          const errorData = await res.json();
          console.error("USER CREATION ERROR:", errorData.message);
        }
      } catch (error) {
        console.error("Signup error:", error);
        toast.error("There was a system error. Please try again later.");
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center drop-shadow-[0_0_100px_rgba(59,130,246,0.6)]">
      <div className="flex items-center mb-8 mt-4">
        <Image
          src="/logo-dark.svg"
          alt="Pack logo"
          width={48}
          height={48}
          className="mr-5"
        />
        <span className="text-3xl font-semibold text-white">Pack</span>
      </div>

      <div className="space-y-3 p-12 bg-[#171717] shadow-xl w-full max-w-sm rounded-xl">
        <div className="pb-3">
          <h1 className="text-2xl font-normal text-white">
            {currentStep === 1 ? "Welcome!" : "Almost there!"}
          </h1>
          <p className="py-2 text-xs montserrat font-medium text-zinc-400">
            {currentStep === 1
              ? "Create your brand new account"
              : "Just a few more details..."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {" "}
          {/* Manual validation takes place on submit */}
          {currentStep === 1 ? (
            // Page 1
            <>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
                    placeholder="Freddy"
                    autoComplete="given-name"
                  />
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                    Role
                  </label>
                  <div className="relative w-full">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full px-3 py-3 pl-4 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      {" "}
                      {/* pointer-events-none helps with accessibility so users can easily use [TAB] to navigate */}
                      <ChevronDown strokeWidth={2.25} color="#F2F2F2" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
                  placeholder="Freddy123"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
                  placeholder="freddy@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="pb-1">
                <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-bold"
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  >
                    <div className="absolute inset-y-0 right-0.5 flex items-center">
                      {showPassword ? (
                        <EyeOff strokeWidth={2} color="#7C7C7C" size={20} />
                      ) : (
                        <Eye strokeWidth={2} color="#7C7C7C" size={20} />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
              >
                Next
              </button>
            </>
          ) : currentStep === 2 ? (
            // Page 2 - STUDENT
            <>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                    Year group
                  </label>
                  <div className="relative w-full">
                    <select
                      value={yearGroup}
                      onChange={(e) => setYearGroup(e.target.value)}
                      required
                      className="w-full px-3 py-3 pl-4 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
                    >
                      <option value="Y10">Year 10</option>
                      <option value="Y11">Year 11</option>
                      <option value="Y12">Year 12</option>
                      <option value="Y13">Year 13</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      {" "}
                      {/* pointer-events-none helps with accessibility so users can easily use [TAB] to navigate */}
                      <ChevronDown strokeWidth={2.25} color="#F2F2F2" />
                    </div>
                  </div>
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                    Progress emails
                  </label>
                  <div className="relative w-full">
                    <select
                      value={progressEmails}
                      onChange={(e) => setProgressEmails(e.target.value)}
                      required
                      className="w-full px-3 py-3 pl-4 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
                    >
                      <option value="Enabled">Enabled</option>
                      <option value="Disabled">Disabled</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      {" "}
                      {/* pointer-events-none helps with accessibility so users can easily use [TAB] to navigate */}
                      <ChevronDown strokeWidth={2.25} color="#F2F2F2" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                  Your subjects:
                </label>
                <div
                  className={`max-h-24 gap-3 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar ${
                    subjects.length > 2 ? "pr-2" : ""
                  }`}
                >
                  {subjects.map((subject, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative w-1/4">
                        <select
                          value={examBoards[index]}
                          onChange={(e) =>
                            updateExamBoard(index, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[#1C1C1C] text-sm text-[#F2F2F2] rounded-md focus:outline-none border border-[#393939] appearance-none"
                        >
                          <option value="AQA">AQA</option>
                          <option value="CCEA">CCEA</option>
                          <option value="Edexcel">Edexcel</option>
                          <option value="Eduqas">Eduqas</option>
                          <option value="OCR">OCR</option>
                          <option value="WJEC">WJEC</option>
                        </select>
                      </div>
                      <div className="relative w-3/4">
                        <select
                          value={subject}
                          onChange={(e) => updateSubject(index, e.target.value)}
                          required
                          className="w-full px-3 py-2 pl-4 bg-[#1C1C1C] text-sm text-[#F2F2F2] rounded-md focus:outline-none border border-[#393939] appearance-none pr-10"
                        >
                          <option value="Biology">Biology</option>
                          <option value="Business">Business</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Citizenship">Citizenship</option>
                          <option value="Classical Civilisation">
                            Classical Civilisation
                          </option>
                          <option value="Computer Science">
                            Computer Science
                          </option>
                          <option value="Criminology">Criminology</option>
                          <option value="Drama">Drama</option>
                          <option value="Economics">Economics</option>
                          <option value="English Language">
                            English Language
                          </option>
                          <option value="English Literature">
                            English Literature
                          </option>
                          <option value="Fine Art">Fine Art</option>
                          <option value="Food Preparation and Nutrition">
                            Food Preparation and Nutrition
                          </option>
                          <option value="Food Science">Food Science</option>
                          <option value="French">French</option>
                          <option value="Further Maths">Further Maths</option>
                          <option value="Geography">Geography</option>
                          <option value="German">German</option>
                          <option value="Graphics Communications">
                            Graphics Communications
                          </option>
                          <option value="History">History</option>
                          <option value="Latin">Latin</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Music">Music</option>
                          <option value="Philosophy">Philosophy</option>
                          <option value="Physical Education">
                            Physical Education
                          </option>
                          <option value="Physics">Physics</option>
                          <option value="Politics">Politics</option>
                          <option value="Product Design">Product Design</option>
                          <option value="Psychology">Psychology</option>
                          <option value="Religious Studies">
                            Religious Studies
                          </option>
                          <option value="Science">Science (Combined)</option>
                          <option value="Sociology">Sociology</option>
                          <option value="Spanish">Spanish</option>
                          <option value="Statistics">Statistics</option>
                          <option value="Textiles">Textiles</option>
                        </select>

                        {subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubject(index)}
                            className="absolute inset-y-0 right-3 flex items-center"
                          >
                            <Trash
                              strokeWidth={2.25}
                              color="#E93F3F"
                              size={15}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-4 pb-3">
                  <button
                    type="button"
                    onClick={() => addNewSubject()}
                    className="px-4 py-2 rounded-md bg-blue-600 text-xs text-white font-medium hover:bg-blue-700 transition"
                  >
                    Add another subject
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/4 py-3 rounded-md bg-[#171717] text-white font-medium hover:bg-[#252525] transition border border-[#393939]"
                >
                  Back
                </button>{" "}
                {/* Button added during testing when wanting to change previous details. Using the browser's back button goes to the page before the Signup page (because the URL doesn't change)*/}
                <button
                  type="submit"
                  className="w-3/4 py-3 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                >
                  Sign up
                </button>
              </div>
            </>
          ) : (
            // Page 3 - TEACHER
            <>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                    Title
                  </label>
                  <div className="relative w-full">
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-3 py-3 pl-4 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                      <option value="Mx">Mx</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      {" "}
                      {/* pointer-events-none helps with accessibility so users can easily use [TAB] to navigate */}
                      <ChevronDown strokeWidth={2.25} color="#F2F2F2" />
                    </div>
                  </div>
                </div>

                <div className="col-span-6">
                  <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                    Surname
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold"
                    placeholder="Brownlee"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                  What subject do you teach?
                </label>
                <div className="relative w-full">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-3 py-3 pl-4 bg-[#1C1C1C] text-[#F2F2F2] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border border-[#393939] appearance-none pr-10"
                  >
                    <option value="Biology">Biology</option>
                    <option value="Business">Business</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Citizenship">Citizenship</option>
                    <option value="Classical Civilisation">
                      Classical Civilisation
                    </option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Criminology">Criminology</option>
                    <option value="Drama">Drama</option>
                    <option value="Economics">Economics</option>
                    <option value="English">English (General)</option>
                    <option value="English Language">English Language</option>
                    <option value="English Literature">
                      English Literature
                    </option>
                    <option value="Fine Art">Fine Art</option>
                    <option value="Food Preparation and Nutrition">
                      Food Preparation and Nutrition
                    </option>
                    <option value="Food Science">Food Science</option>
                    <option value="French">French</option>
                    <option value="Further Maths">Further Maths</option>
                    <option value="Geography">Geography</option>
                    <option value="German">German</option>
                    <option value="Graphics Communications">
                      Graphics Communications
                    </option>
                    <option value="History">History</option>
                    <option value="Latin">Latin</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Maths">Maths (General)</option>
                    <option value="Music">Music</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Physical Education">
                      Physical Education
                    </option>
                    <option value="Physics">Physics</option>
                    <option value="Politics">Politics</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Religious Studies">Religious Studies</option>
                    <option value="Science">Science (General)</option>
                    <option value="Sociology">Sociology</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Statistics">Statistics</option>
                    <option value="Textiles">Textiles</option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    {" "}
                    {/* pointer-events-none helps with accessibility so users can easily use [TAB] to navigate */}
                    <ChevronDown strokeWidth={2.25} color="#F2F2F2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B4B4B4] mb-3">
                  Your classes:
                </label>
                <div
                  className={`max-h-24 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar ${
                    classes.length > 2 ? "pr-2" : ""
                  }`}
                >
                  {classes.map((className, index) => (
                    <div key={index} className="relative w-full">
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => updateClass(index, e.target.value)}
                        required
                        className={`w-full px-4 py-2 bg-[#1C1C1C] text-sm text-[#F2F2F2] rounded-md focus:outline-none border border-[#393939] placeholder:text-[#4D4D4D] placeholder:font-semibold ${
                          classes.length > 1 ? "pr-10" : "" // Adds padding for delete button if there are more than 2 classes
                        }`}
                        placeholder={(() => {
                          const words = subject.split(" ");
                          let prefix = "";
                          if (words.length >= 2) {
                            prefix = words[0][0] + words[1][0];
                          } else {
                            prefix = subject.slice(0, 2);
                          }

                          return `${prefix.toUpperCase()}${(index + 1)
                            .toString()
                            .padStart(2, "0")}`; // Adds 0 to the start of number if (index + 1) < 10
                        })()}
                      />
                      {classes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeClass(index)}
                          className="absolute inset-y-0 right-3 flex items-center"
                        >
                          <Trash strokeWidth={2.25} color="#E93F3F" size={15} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-4 pb-3">
                  <button
                    type="button"
                    onClick={() => addNewClass()}
                    className="px-4 py-2 rounded-md bg-blue-600 text-xs text-white font-medium hover:bg-blue-700 transition"
                  >
                    Add another class
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/4 py-3 rounded-md bg-[#171717] text-white font-medium hover:bg-[#252525] transition border border-[#393939]"
                >
                  Back
                </button>{" "}
                {/* Button added during testing when wanting to change previous details. Using the browser's back button goes to the page before the Signup page (because the URL doesn't change)*/}
                <button
                  type="submit"
                  className="w-3/4 py-3 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
                >
                  Sign up
                </button>
              </div>
            </>
          )}
        </form>

        <p className="text-[0.7rem] montserrat text-zinc-400">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Log in now!
          </a>
        </p>
      </div>

      <div className="fixed bottom-0 pb-3">
        <p className="text-center text-xs font-medium text-[#B4B4B4]">
          By creating an account, you agree to our <br />
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
      <Toaster />
    </div>
  );
}
