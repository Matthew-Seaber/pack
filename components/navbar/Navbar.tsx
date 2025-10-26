import LinksDropdown from "./LinksDropdown";
import DarkMode from "./UITheme";
import Logo from "./Logo";

function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-[1600px] mx-auto px-6 flex justify-between py-6 gap-4">
        <Logo />

        <div className="flex gap-4 items-center flex-shrink-0">
          <DarkMode />
          <LinksDropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
