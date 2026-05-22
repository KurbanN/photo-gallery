-- Убрать стандартное фото login-bg.jpg из настроек мероприятий
update public.events
set settings = settings - 'loginBgUrl'
where settings->>'loginBgUrl' like '%login-bg.jpg%';
