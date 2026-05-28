import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Countdown from '@/components/invite/Countdown';
import InviteCard from '@/components/invite/InviteCard';
import RSVPForm from '@/components/invite/RSVPForm';
import ThankYou from '@/components/invite/ThankYou';
import { fetchInvite, submitRSVP, type InviteData } from '@/lib/invite-api';

function localKey(slug: string) {
  return `invite-rsvp-${slug}`;
}

export default function InvitePublic() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const data = await fetchInvite(slug);
        setInvite(data);
        setDone(localStorage.getItem(localKey(slug)) === '1');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div className="p-6">Загрузка...</div>;
  if (error || !invite) return <div className="p-6 text-red-700">{error || 'Не найдено'}</div>;

  const pageBg = invite.template === 'invitarium' ? 'bg-[#F8F8F7]' : 'bg-[#FAFAF7]';

  return (
    <div className={`min-h-dvh ${pageBg} px-4 py-8 animate-in fade-in duration-500`}>
      <div className="mx-auto w-full max-w-xl">
        <InviteCard
          invite={invite}
          invitariumRsvp={
            invite.template === 'invitarium'
              ? {
                  loading: submitting,
                  done,
                  thankYou: <ThankYou />,
                  onSubmit: async ({ name, status, comment }) => {
                    setSubmitting(true);
                    try {
                      await submitRSVP(slug, { name, status, comment });
                      localStorage.setItem(localKey(slug), '1');
                      setDone(true);
                    } finally {
                      setSubmitting(false);
                    }
                  },
                }
              : undefined
          }
        >
          {invite.template !== 'invitarium' ? (
            <>
              <Countdown targetIso={invite.date} />
              <div className="mt-6">
                {done ? (
                  <ThankYou />
                ) : (
                  <RSVPForm
                    loading={submitting}
                    onSubmit={async ({ name, status, comment }) => {
                      setSubmitting(true);
                      try {
                        await submitRSVP(slug, { name, status, comment });
                        localStorage.setItem(localKey(slug), '1');
                        setDone(true);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                  />
                )}
              </div>
            </>
          ) : null}
        </InviteCard>
      </div>
    </div>
  );
}
