import { useState } from 'react';
import type { RSVPStatus } from '@/lib/invite-api';

const HEART_SVG = (
  <svg width="59" height="50" viewBox="0 0 47 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      className="bool-icon-path"
      d="M23.5 40C23.2622 40 23.0246 39.9396 22.8116 39.8185C22.5803 39.6872 17.0843 36.5471 11.5095 31.8157C8.20538 29.0115 5.56788 26.2302 3.67045 23.5492C1.21507 20.0799 -0.0196826 16.7429 0.00023721 13.6307C0.0235535 10.0093 1.34166 6.6036 3.71203 4.04089C6.12242 1.43501 9.33916 0 12.7699 0C17.1667 0 21.1865 2.4236 23.5001 6.26287C25.8136 2.42369 29.8335 0 34.2303 0C37.4714 0 40.5638 1.29481 42.938 3.64596C45.5435 6.2261 47.0239 9.87171 46.9997 13.6478C46.9797 16.7546 45.7218 20.0866 43.261 23.5511C41.3577 26.2308 38.7239 29.0108 35.4327 31.8142C29.8783 36.5451 24.4218 39.6851 24.1922 39.8164C23.9782 39.9388 23.739 40 23.5 40Z"
    />
  </svg>
);

const CROSS_SVG = (
  <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      className="bool-icon-path"
      d="M39.1517 7.85205L32.1525 0.852845C31.0214 -0.278249 29.189 -0.278249 28.0579 0.852845L20 8.91076L11.9421 0.84832C10.811 -0.282773 8.97862 -0.282773 7.84753 0.84832L0.84832 7.85205C-0.282773 8.98315 -0.282773 10.8155 0.84832 11.9466L8.90623 20.0045L0.84832 28.0579C-0.282773 29.189 -0.282773 31.0214 0.84832 32.1525L7.84753 39.1517C8.97862 40.2828 10.811 40.2828 11.9421 39.1517L20 31.0938L28.0579 39.1517C29.189 40.2828 31.0214 40.2828 32.1525 39.1517L39.1517 32.1525C40.2828 31.0214 40.2828 29.189 39.1517 28.0579L31.0938 20L39.1517 11.9421C40.2828 10.811 40.2828 8.97862 39.1517 7.84753V7.85205Z"
    />
  </svg>
);

export default function InvitariumRSVPForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (payload: { name: string; status: RSVPStatus; comment: string }) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null);
  const [transfer, setTransfer] = useState<'yes' | 'no' | ''>('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  return (
    <form
      className="form"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
          setError('Укажите имя');
          return;
        }
        if (!attending) {
          setError('Выберите, придёте ли вы');
          return;
        }
        const status: RSVPStatus = attending === 'yes' ? 'attending' : 'declined';
        const extra =
          transfer === 'yes' ? 'Нужен трансфер: да' : transfer === 'no' ? 'Нужен трансфер: нет' : '';
        const fullComment = [extra, comment.trim()].filter(Boolean).join('\n');
        try {
          await onSubmit({ name: name.trim(), status, comment: fullComment });
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ошибка отправки');
        }
      }}
    >
      <div className="form__body">
        <div className="card_form" style={{ backgroundColor: '#F8F8F7' }}>
          <div className="card_form__caption form_question">
            Ваше имя <span>*</span>
          </div>
          <div className="card_form__answer form_response">
            <input
              type="text"
              className="card_form__input form_response"
              placeholder="Введите имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="card_form" style={{ backgroundColor: '#F8F8F7' }}>
          <div className="card_form__caption form_question">
            Вы придете? <span>*</span>
          </div>
          <div className="card_form__bool">
            <label className="bool">
              <input
                className="bool__input"
                type="radio"
                name="invitarium-attending"
                checked={attending === 'yes'}
                onChange={() => setAttending('yes')}
              />
              <div className="bool__icon heart">
                <div className="bool__icon_inner">
                  <div className="bool__icon_svg">{HEART_SVG}</div>
                </div>
              </div>
              <span className="bool__text form_response">да</span>
            </label>
          </div>
          <div className="card_form__bool">
            <label className="bool">
              <input
                className="bool__input"
                type="radio"
                name="invitarium-attending"
                checked={attending === 'no'}
                onChange={() => setAttending('no')}
              />
              <div className="bool__icon cross">
                <div className="bool__icon_inner">
                  <div className="bool__icon_svg">{CROSS_SVG}</div>
                </div>
              </div>
              <span className="bool__text form_response">нет</span>
            </label>
          </div>
        </div>

        <div className="card_form" style={{ backgroundColor: '#F8F8F7' }}>
          <div className="card_form__caption form_question">
            Вам нужен трансфер? <span>*</span>
          </div>
          <div className="card_form__answer form_response">
            <div className="card_form__radio">
              <input
                type="radio"
                name="invitarium-transfer"
                id="invitarium-transfer-yes"
                checked={transfer === 'yes'}
                onChange={() => setTransfer('yes')}
              />
              <label htmlFor="invitarium-transfer-yes">да</label>
            </div>
            <div className="card_form__radio">
              <input
                type="radio"
                name="invitarium-transfer"
                id="invitarium-transfer-no"
                checked={transfer === 'no'}
                onChange={() => setTransfer('no')}
              />
              <label htmlFor="invitarium-transfer-no">нет</label>
            </div>
          </div>
        </div>
      </div>

      <div className="edit__row">
        <div className="edit__center">
          <div className="form__response">
            <button type="submit" className="sand__submit" disabled={loading}>
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
          {error ? <p className="mt-2 text-center text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </form>
  );
}
