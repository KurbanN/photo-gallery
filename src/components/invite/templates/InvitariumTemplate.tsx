import type { InviteData } from '@/lib/invite-api';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildMaket12ShellQuery } from './invitarium/buildMaket12ShellQuery';
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
  const [frameHeight, setFrameHeight] = useState(720);
  const iframeSrc = useMemo(() => {
    const qs = buildMaket12ShellQuery(invite);
    const base = maket12ShellIndexUrl();
    return qs ? `${base}?${qs}` : base;
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
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={invite.title || 'Invitation'}
        className="w-full border-0"
        style={{ height: frameHeight, minHeight: 480 }}
        scrolling="no"
      />
    </div>
  );
}
