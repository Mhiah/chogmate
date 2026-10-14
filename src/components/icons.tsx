const paths: Record<string, string> = {
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
  feed: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 14h8M8 18h5"/>',
  arena: '<path d="M3 10c0-3 4-5 9-5s9 2 9 5v6c0 2-4 4-9 4s-9-2-9-4z"/><path d="M3 10c0 2 4 4 9 4s9-2 9-4"/>',
  hall: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10l9-6 9 6z"/>',
  shop: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>',
};

export function Icon({ k }: { k: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths[k] }} />;
}

export function ChogFace({ size = 46 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M16 3l3 5 5-3-1 6 6 1-4 4 4 4-6 1 1 5-5-2-3 5-3-5-5 2 1-5-6-1 4-4-4-4 6-1-1-6 5 3z" fill="#5b3ab8" />
      <ellipse cx="16" cy="17.5" rx="7" ry="6" fill="#fff2d8" />
      <path d="M12 12l2 3 2-3 2 3 2-3v-2h-8z" fill="#5b3ab8" />
      <ellipse cx="13.4" cy="17.3" rx="1.3" ry="1.8" fill="#14091f" />
      <ellipse cx="18.6" cy="17.3" rx="1.3" ry="1.8" fill="#14091f" />
      <circle cx="13.8" cy="16.6" r=".45" fill="#fff" />
      <circle cx="19" cy="16.6" r=".45" fill="#fff" />
      <circle cx="11.2" cy="19.6" r="1.1" fill="#e0507d" opacity=".8" />
      <circle cx="20.8" cy="19.6" r="1.1" fill="#e0507d" opacity=".8" />
      <path d="M15.4 19.6h1.2l-.6.7z" fill="#e85a8f" />
      <path d="M15 21.2q1 .8 2 0" stroke="#2a1450" strokeWidth=".8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export const ctrlIcons = {
  zin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>,
  zout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>,
  rot: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v5h-5" /></svg>,
  reset: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" /></svg>,
  close: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>,
};
