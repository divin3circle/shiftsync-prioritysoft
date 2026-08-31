-- Fire the notify-email edge function whenever a notification is created.
-- pg_net makes the call asynchronous, and the exception guard means a failed
-- or misconfigured email delivery can never block the notification itself.
-- The function no-ops until RESEND_API_KEY is set on the edge function, so this
-- is safe to run before an email provider is configured.
create extension if not exists pg_net;

create or replace function notify_email_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    perform net.http_post(
      url := 'https://bqaczqgvxuhglsbtxmqs.functions.supabase.co/notify-email',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('record', to_jsonb(new))
    );
  exception when others then
    null;
  end;
  return new;
end;
$$;

create trigger notifications_send_email
  after insert on notifications
  for each row execute function notify_email_on_insert();
