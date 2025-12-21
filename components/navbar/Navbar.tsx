import LinksDropdown from "./LinksDropdown";
import ThemeSwitcher from "./UITheme";
import NotificationBox from "./NotificationBox";
import Logo from "./Logo";
import NavbarLinks from "./NavbarLinks";

function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center py-6 gap-4">
        <Logo />
        <NavbarLinks />

        <div className="flex gap-4 items-center flex-shrink-0">
          <NotificationBox />
          <ThemeSwitcher />

          <LinksDropdown />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
