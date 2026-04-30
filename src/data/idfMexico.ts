/**
 * idfMexico.ts
 * Datos IDF Diabetes Atlas — México.
 * Fuente: idf_diabetes_atlas (tabla Mexico)
 *
 * TODO: reemplazar con llamada al backend GET /datasets/idf/mexico
 * cuando los datos estén cargados en BD.
 *
 * Estructura del CSV original:
 *   indicador | 2000 | 2011 | 2024 | 2050
 */

export const IDF_MEXICO = {
    // Personas con diabetes (miles)
    peopleWithDiabetes: {
      y2000: 4_387.3,
      y2011: 10_293.7,
      y2024: 13_587.4,
      y2050: 19_946.9,
      unit:  'miles de personas',
    },
  
    // Prevalencia estandarizada por edad (%)
    ageStandardisedPrevalence: {
      y2000: 14.2,
      y2011: 15.6,
      y2024: 16.4,
      y2050: 18.0,
      unit:  '%',
    },
  
    // No diagnosticados (solo 2024)
    undiagnosed: {
      proportion: 41.3,    // % del total
      people:     5_617.9, // miles de personas
      unit:       '%',
    },
  
    // Muertes atribuibles a diabetes
    deaths: {
      y2011: 71_087,
      y2024: 123_364.6,
      unit:  'personas',
    },
  
    // Proporción de muertes relacionadas con diabetes (20-79 años)
    deathsProportion20_79: {
      y2024: 22.8,
      unit:  '%',
    },
  
    // Gasto en salud relacionado con diabetes
    healthExpenditure: {
      totalUsdMillions: {
        y2024: 19_539.1,
        y2050: 23_540.0,
        unit:  'USD millones',
      },
      perPersonUsd: {
        y2011: 815,
        y2024: 1_438.0,
        y2050: 1_180.1,
        unit:  'USD por persona',
      },
    },
  } as const