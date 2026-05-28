import InviteCard from '@/components/invite/InviteCard';
import { INVITARIUM_DEFAULT } from '@/components/invite/templates/invitarium/config';
import type { InviteData } from '@/lib/invite-api';

/** Локальное превью maket12 (Canva + embed Invitarium): /preview/invitarium */
const DEMO_INVITE: InviteData = {
  eventId: 'preview',
  slug: 'preview-invitarium',
  template: 'invitarium',
  title: INVITARIUM_DEFAULT.title,
  label: INVITARIUM_DEFAULT.label,
  quote: INVITARIUM_DEFAULT.quote,
  message: INVITARIUM_DEFAULT.message,
  venueName: INVITARIUM_DEFAULT.venueName,
  location: INVITARIUM_DEFAULT.location,
  city: INVITARIUM_DEFAULT.city,
  mapUrl: 'https://www.google.com/maps',
  date: '2026-08-02T14:30:00.000Z',
};

export default function InviteInvitariumPreview() {
  return (
    <div className="min-h-dvh bg-[#F8F8F7]">
      <p className="px-4 pt-4 text-center text-xs text-[#9F998E]">
        Превью maket12: оригинальный Canva-export и embed Invitarium (как на bomainvite.com/maket12). RSVP — демо.
      </p>
      <div className="mx-auto w-full max-w-[480px]">
        <InviteCard
          invite={DEMO_INVITE}
          invitariumRsvp={{
            loading: false,
            done: false,
            onSubmit: async () => {
              window.alert('Демо: RSVP работает на сохранённом invite по /invite/…');
            },
          }}
        />
      </div>
    </div>
  );
}
