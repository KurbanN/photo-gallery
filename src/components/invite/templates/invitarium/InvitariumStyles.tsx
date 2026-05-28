import { invitariumBuildBase } from './paths';

/** Подключает оригинальные CSS из зеркала Invitarium. */
export default function InvitariumStyles() {
  const base = invitariumBuildBase();
  const sheets = ['pages.css', 'form.css', 'countdown.css', 'app.css'] as const;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Josefin+Sans:wght@300;400&family=Mulish:wght@300;400;600;700&family=Roboto:wght@300;400&display=swap"
        rel="stylesheet"
      />
      {sheets.map((file) => (
        <link key={file} rel="stylesheet" href={`${base}/assets/css/${file}`} />
      ))}
    </>
  );
}
