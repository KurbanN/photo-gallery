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


export default function InvitariumTemplate({
  invite,
  rsvp,
}: {
  invite: InviteData;
  rsvp?: InvitariumRsvpProps;
}) {
  const [frameSrc, setFrameSrc] = useState<string | null>(null);
  const [frameHeight, setFrameHeight] = useState(720);
  const blobRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetch(maket12ShellIndexUrl())
      .then((r) => r.text())
      .then((html) => {
        if (cancelled) return;
        const patched = patchMaket12Html(html, invite);
        const blob = new Blob([patched], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        blobRef.current = url;
        setFrameSrc(url);
      });

    return () => {
      cancelled = true;
      if (blobRef.current) {
        URL.revokeObjectURL(blobRef.current);
        blobRef.current = null;
      }
    };
  }, [invite.title, invite.date, invite.label, invite.message, invite.quote, invite.venueName, invite.location, invite.city]);

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

  if (rsvp?.done && rsvp.thankYou) {
    return (
      <div className="mx-auto w-full max-w-[480px] rounded-xl bg-[#F8F8F7] p-6 text-center">
        {rsvp.thankYou}
      </div>
    );
  }

  return (
    <div className="invitarium-shell mx-auto w-full max-w-[480px] overflow-hidden bg-[#F8F8F7]">
      {frameSrc ? (
        <iframe
          src={frameSrc}
          title={invite.title || 'Invitation'}
          className="w-full border-0"
          style={{ height: frameHeight, minHeight: 480 }}
          scrolling="no"
        />
      ) : (
        <div className="flex min-h-[480px] items-center justify-center text-sm text-[#9F998E]">
          Загрузка приглашения…
        </div>
      )}
    </div>
  );
}
