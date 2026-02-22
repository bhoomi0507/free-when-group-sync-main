import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border py-10">
    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <Link to="/" className="font-heading font-bold text-foreground tracking-tight">
        LinkUp
      </Link>
      <p className="text-sm text-muted-foreground">
        made for groups that actually meet up
      </p>
    </div>
  </footer>
);

export default Footer;
