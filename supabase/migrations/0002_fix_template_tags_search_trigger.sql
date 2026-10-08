-- Fix refresh_template_search_for_template() for the template_tags table.
--
-- template_tags has a composite key (template_id, tag_id) and no id column,
-- so the shared row trigger derived the target template with
-- coalesce(new.id, old.id), which fails at runtime with
-- 'record "new" has no field "id"' on every template_tags insert or delete.
-- Branch on tg_table_name and use template_id for link rows.
create or replace function refresh_template_search_for_template()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'template_tags' then
    perform refresh_template_search(coalesce(new.template_id, old.template_id));
  else
    perform refresh_template_search(coalesce(new.id, old.id));
  end if;
  return null;
end;
$$;
