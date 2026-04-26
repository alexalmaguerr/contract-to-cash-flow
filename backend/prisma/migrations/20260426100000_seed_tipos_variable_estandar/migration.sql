-- Inserta los TipoVariable con códigos reservados para cotización.
-- Usa INSERT ... ON CONFLICT DO NOTHING para ser idempotente.

INSERT INTO catalogo_tipos_variable (id, codigo, nombre, tipo_dato, valores_posibles, unidad, activo, created_at, updated_at)
VALUES
  -- Diámetros
  (gen_random_uuid(), 'DIAMETRO_TOMA',      'Diámetro de la toma',       'LISTA',   '["1/2\"","3/4\"","1\"","1.5\"","2\"","3\"","4\""]', 'pulg.', true, now(), now()),
  (gen_random_uuid(), 'DIAMETRO_DESCARGA',  'Diámetro de la descarga',   'LISTA',   '["1/2\"","3/4\"","1\"","1.5\"","2\"","3\"","4\""]', 'pulg.', true, now(), now()),

  -- Materiales (clave interna → cotizacion-tarifas.ts)
  (gen_random_uuid(), 'MATERIAL_CALLE',     'Material de la calle',      'LISTA',   '["concreto","losa","adoquin","concreto_asfaltico","empedrado","tierra"]',              null, true, now(), now()),
  (gen_random_uuid(), 'MATERIAL_BANQUETA',  'Material de la banqueta',   'LISTA',   '["concreto","asfalto","adoquin","adocreto","empedrado","tierra","cantera"]',           null, true, now(), now()),

  -- Metros lineales
  (gen_random_uuid(), 'METROS_TOMA',        'Metros lineales de toma',   'NUMERO',  null,                                                                                  'm.l.', true, now(), now()),
  (gen_random_uuid(), 'METROS_DESCARGA',    'Metros lineales de descarga','NUMERO', null,                                                                                  'm.l.', true, now(), now()),

  -- Unidades
  (gen_random_uuid(), 'UNIDADES_SERVIDAS',  'Unidades servidas',         'NUMERO',  null,                                                                                  'uds.', true, now(), now()),

  -- Medidor
  (gen_random_uuid(), 'TIPO_MEDIDOR',       'Tipo de medidor',           'LISTA',   '["velocidad","volumetrico","mayor"]',                                                 null, true, now(), now()),
  (gen_random_uuid(), 'PLAN_PAGO_MEDIDOR',  'Plan de pago del medidor',  'LISTA',   '["contado","12parc","24parc"]',                                                       null, true, now(), now())

ON CONFLICT (codigo) DO NOTHING;
