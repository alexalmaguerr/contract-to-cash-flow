# Catálogo municipios Querétaro (SIGE / domicilio)

## Origen

- Archivo: `_DocumentacIon_Interna_Sistema_Anterior/Gestion Servicio/Contratos/Catálogos de domicilio.xlsx`
- Hoja: `Municipio (provincia)`
- Filtro: `procomid = 22` (provincia / estado Querétaro en el legado SIGE)

Columnas en el Excel: `proid`, `pronombre`, `procomid`, `proindblk`.

## Carga en la app

- Datos versionados: `backend/prisma/data/catalogo-municipios-qro-sige.json`
- Sembrado: función `seedInegiQueretaro()` en `backend/prisma/seed.ts` (estado INEGI `22` + municipios con `claveINEGI` = `22` + `proid` en tres dígitos, p. ej. `22014` = Querétaro).

## Clave INEGI

`proid` del Excel coincide con el **municipio** de la clave geoestadística INEGI para la entidad 22 (tres dígitos CVE_MUN). La clave única en BD es `claveINEGI` = `22` + `proid` rellenado a 3 dígitos.

## Activo (`activo` en BD)

El JSON versionado puede marcar municipios como inactivos según `proindblk` en el Excel legado; para que los **18** municipios aparezcan en selectores de domicilio, conviene mantenerlos con `activo: true` salvo requisito explícito de negocio.

## Localidades (AGEEML → JSON → seed)

El listado masivo de localidades **no** se lee del Excel en producción. Se genera en desarrollo con `npm run export:localidades-qro-json` a partir del export INEGI (**AGEEML**, hoja `Consulta`) y se guarda en **`backend/prisma/data/catalogo-localidades-qro-ageeml.json`**. `seedInegiQueretaro` carga ese archivo tras los municipios. Detalle en `docs/import-catalogo-inegi.md`.

## Demo colonias

Las colonias de demostración siguen definidas en `seed.ts` para los municipios INEGI **22014** (Querétaro) y **22011** (El Marqués).

Si una base ya tenía datos sembrados con claves antiguas incorrectas (`22001` como ciudad de Querétaro), conviene `prisma migrate reset` o limpiar manualmente catálogos INEGI de Querétaro antes de volver a sembrar.
