const Footer = () => {
  return (
    <footer className="footer bg-neutral text-neutral-content items-center p-4">
      <aside className="grid-flow-col items-center">
        <p>Copyright © {new Date().getFullYear()} - Todos los derechos reservados</p>
      </aside>
      <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a href="https://open.spotify.com/intl-es/artist/4tJYTnNuv6kRnfesJfs3mc?si=lU1pYTRUR86hJFL3-fSV-A" target="_blank" rel="noopener noreferrer">
          <img src="/icons/spotify.svg" alt="Spotify Icon" className="h-6 w-6" />
        </a>
        <a href="https://www.youtube.com/channel/UCCCLuw8VLzV6nPq0AOheoXQ" target="_blank" rel="noopener noreferrer">
          <img src="/icons/youtube.svg" alt="Youtube Icon" className="h-6 w-6" />
        </a>
        <a href="https://www.instagram.com/yazwick/" target="_blank" rel="noopener noreferrer">
          <img src="/icons/instagram.svg" alt="instagram Icon" className="h-6 w-6"/>
        </a>
      </nav>
    </footer>
  );
};

export default Footer;
