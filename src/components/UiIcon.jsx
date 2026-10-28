const PATHS = {
  spark: <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />,
  code: <path d="M9 8L5 12l4 4M15 8l4 4-4 4M13 6l-2 12" />,
  pin: (
    <path d="M12 21s6-5.1 6-10a6 6 0 10-12 0c0 4.9 6 10 6 10zM12 13a2 2 0 100-4 2 2 0 000 4z" />
  ),
  note: <path d="M7 4h10a2 2 0 012 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 012-2h2" />,
  cloud: <path d="M8 18h9a4 4 0 10-.7-7.9A5 5 0 007 11a3 3 0 001 7z" />,
  lab: <path d="M10 3h4M10 3v4l-4 8a3 3 0 003 4h6a3 3 0 003-4l-4-8V3" />,
  idea: (
    <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3 11c.7.5 1.2 1.3 1.2 2.2h3.6c0-.9.5-1.7 1.2-2.2A6 6 0 0012 3z" />
  ),
  chart: <path d="M5 19h14M8 16V9M12 16V5M16 16v-7" />,
  rocket: <path d="M5 19l4-1 9-9a4 4 0 00-5-5l-9 9-1 4 2 2zM12 7l5 5" />,
  email: <path d="M4 7h16v10H4zM4 8l8 6 8-6" />,
  clock: <path d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  check: <path d="M5 13l4 4L19 7" />,
  chat: <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-5 4V6z" />,
  play: <path d="M8 5l11 7-11 7V5z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
  filter: <path d="M4 5h16M7 12h10M10 19h4" />,
};

function UiIcon({ name, className = "ui-icon" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      {PATHS[name] || PATHS.spark}
    </svg>
  );
}

export default UiIcon;
