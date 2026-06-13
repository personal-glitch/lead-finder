// Schwebender WhatsApp-Button (Click-to-Chat). Kein JS nötig – reiner Link.
const WA_URL =
  "https://wa.me/4915292627062?text=" +
  encodeURIComponent("Hallo, ich interessiere mich für KundenRadar.");

export function WhatsAppFab() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Per WhatsApp schreiben"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 md:bottom-6 md:right-6"
      style={{ background: "#25D366" }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" fill="#ffffff" aria-hidden="true">
        <path d="M16.04 4c-6.6 0-11.96 5.36-11.96 11.96 0 2.1.55 4.16 1.6 5.98L4 28l6.22-1.63a11.9 11.9 0 0 0 5.82 1.5h.01c6.6 0 11.96-5.36 11.96-11.96C28.01 9.36 22.64 4 16.04 4zm0 21.9h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.69.97.98-3.6-.24-.37a9.9 9.9 0 0 1-1.52-5.27c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.15 1.04 7.03 2.92a9.88 9.88 0 0 1 2.91 7.03c0 5.49-4.46 9.95-9.94 9.95zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
