import type { InviteData } from '@/lib/invite-api';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { patchMaket12Html } from './invitarium/patchMaket12Html';
import { maket12ShellIndexUrl } from './invitarium/paths';

export type InvitariumRsvpProps = {
  loading: boolean;
  done: boolean;
  onSubmit: (payload: { name: string; status: 'attending' | 'maybe' | 'declined'; comment: string }) => Promise<void>;
  thankYou?: ReactNode;
};

const inviteKey = (invite: InviteData) =>
  [
    invite.title,
    invite.date,
    invite.label,
    invite.message,
    invite.quote,
    invite.venueName,
    invite.location,
    invite.city,
  ].join('\0');

export default function InvitariumTemplate({
  invite,
  rsvp,
}: {
  invite: InviteData;
  rsvp?: InvitariumRsvpProps;
}) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [frameHeight, setFrameHeight] = useState(720);
  const [loadError, setLoadError] = useState(false);
  const shellHtmlRef = useRef<string | null>(null);
  const inviteRef = useRef(invite);
  inviteRef.current = invite;

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);

    void fetch(maket12ShellIndexUrl())
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((html) => {
        if (cancelled) return;
        shellHtmlRef.current = html;
        setSrcDoc(patchMaket12Html(html, inviteRef.current));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const shell = shellHtmlRef.current;
    if (!shell) return;

    const timer = window.setTimeout(() => {
      setSrcDoc(patchMaket12Html(shell, invite));
    }, 280);

    return () => window.clearTimeout(timer);
  }, [inviteKey(invite)]);

  const onMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data as {
        type?: string;
        height?: number;
        payload?: { name: string; status: string; comment: string };
      };
      if (data?.type === 'maket12-resize' && typeof data.height === 'number') {
        setFrameHeight(Math.max(480, Math.ceil(data.height)));
      }
      if (data?.type === 'invitarium-rsvp' && rsvp && data.payload) {
        const { name, status, comment } = data.payload;
        const normalized =
          status === 'attending' || status === 'declined' || status === 'maybe'
            ? status
            : 'maybe';
        void rsvp.onSubmit({ name, status: normalized, comment: comment ?? '' });
      }
    },
    [rsvp],
  );

  useEffect(() => {
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onMessage]);

  if (loadError) {
    return (
      <div className="mx-auto max-w-[480px] rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">
        Не удалось загрузить макет. Проверьте, что{' '}
        <code className="text-xs">invite-assets/maket12-shell</code> доступен на сервере.
      </div>
    );
  }

  return (
    <div className="invitarium-shell mx-auto w-full max-w-[480px] space-y-4 bg-[#F8F8F7]">
      {rsvp?.done && rsvp.thankYou ? (
        <div className="rounded-xl border border-[#d7c7ad]/60 bg-[#FAFAF7] p-4 shadow-sm">{rsvp.thankYou}</div>
      ) : null}
      <div className="overflow-hidden">
        {srcDoc ? (
          <iframe
            srcDoc={srcDoc}
            title={invite.title || 'Invitation'}
            className="w-full border-0"
            style={{ height: frameHeight, minHeight: 480 }}
            scrolling="no"
            tabIndex={-1}
          />
        ) : (
          <div className="flex min-h-[480px] items-center justify-center text-sm text-[#9F998E]">
            Загрузка приглашения…
          </div>
        )}
      </div>
    </div>
  );
}
