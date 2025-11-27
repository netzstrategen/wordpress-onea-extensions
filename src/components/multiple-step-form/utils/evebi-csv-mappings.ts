/**
 * EVEBI CSV Data Mapping
 *
 * This file maps our form fields to EVEBI CSV import format.
 * Reference: https://hilfe.evebi.de/latest/EVEBI%20-%20Module/EVEBI%20-%20Datenimport%20Energieausweise/
 *
 * Structure for each mapping:
 * - labelMapping: Object mapping EVEBI field name to our field name
 * - evebiExpects: What EVEBI expects (description or specific values)
 * - weProvide: What we collect in our form
 * - valueMapping: If values need to be translated (our value → EVEBI value)
 *
 * CSV Format Requirements:
 * - Encoding: UTF-8
 * - Decimal separator: comma (,)
 * - Field delimiter: semicolon (;)
 */

/**
 * All mappings for Bedarfsausweis (WG-B) - Demand-based certificate
 */
export const BEDARFSAUSWEIS_MAPPINGS = [
  // Address & Customer Data
  {
    labelMapping: { Str: "objectStreet" },
    evebiExpects: "string",
    weProvide: "string",
  },
  {
    labelMapping: { HNr: "objectNumber" },
    evebiExpects: "string",
    weProvide: "string",
  },
  {
    labelMapping: { PLZ: "objectZip" },
    evebiExpects: "string",
    weProvide: "string",
  },
  {
    labelMapping: { Ort: "objectCity" },
    evebiExpects: "string",
    weProvide: "string",
  },
  // Building Basic Data
  {
    labelMapping: { Geb_Baujahr: "buildingYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Anz_WE: "numberOfUnits" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { AN: "livingArea" },
    evebiExpects:
      "Living area in m² as number with comma decimal (e.g., 150,5)",
    weProvide: "Number from form (convert dot to comma)",
  },
  {
    labelMapping: { Geb_Kategorie: "buildingType" },
    evebiExpects: "Building type code",
    weProvide: "Building type string",
    valueMapping: {
      einfamilienhaus: "GT_GANZES_GEB",
      zweifamilienhaus: "GT_GANZES_GEB",
      mehrfamilienhaus: "GT_GANZES_GEB",
      wohnteilGemischt: "GT_TEIL_DES_WG", // Part of residential building or mixed use
    },
  },
  // Heating System
  {
    labelMapping: { Hzg_Verteilung_Art: "heatingDistributionType" },
    evebiExpects: "Numeric code: 0, 1, or 2",
    weProvide: "String: dezentral, gebaeudezentral, or wohnungszentral",
    valueMapping: {
      dezentral: "0",
      gebaeudezentral: "1",
      wohnungszentral: "2",
    },
  },
  {
    labelMapping: { Hzg_Baujahr: "heatingYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Hzg_Anlagentyp: "heatingSystemType" },
    evebiExpects: "Heating technology code",
    weProvide: "Heating system type string",
    valueMapping: {
      niedertemperaturkessel: "HZT_NT_KESSEL",
      brennwertgeraet: "HZT_BW_GERAET",
      nachtspeicher: "HZT_NACHTSP",
      kwk: "HZT_KWK",
      hellstrahler: "HZT_HELLSTR",
      fernheizung: "HZT_FERNHZ",
      dunkelstrahler: "HZT_DUNKELSTR",
      luftheizung: "HZT_LUFTHZ",
      brennstoffzelle: "HZT_FC",
      solarkollektor: "HZT_KOLLEKTOR",
      sorptionsGaswaermepumpe: "HZT_WP_SORPTION",
      waermepumpe: "HZT_WP_MOTORISCH",
      ofenWechselbrand: "HZT_WECHSELBR",
      standardkessel: "HZT_STD_KESSEL",
    },
  },
  {
    labelMapping: { Hzg_Energietraeger: "fuelType" },
    evebiExpects: "Fuel type code",
    weProvide: "Fuel type string",
    valueMapping: {
      biogas: "BK_GAS", // Biogas falls under gas
      biooeel: "BK_OEL", // Bio-oil
      braunkohle: "BK_BRAUNKOHLE",
      fernwaermeKWK: "BK_PROZESSWAERME", // District heating from CHP
      fernwaermeHeizwerk: "BK_FERNHZ", // District heating from heating plant
      erdgas: "BK_GAS",
      fluessiggas: "BK_FLUESSIGGAS",
      holzhackschnitzel: "BK_HHS",
      holz: "BK_HOLZ",
      steinkohle: "BK_KOHLE",
      stromNT: "BK_NACHTSTR", // Night storage electricity
      heizoel: "BK_OEL",
      holzpellets: "BK_PELLET",
      strom: "BK_STROM",
    },
  },
  {
    labelMapping: { Hzg_Aufstellung: "systemTypeAndLocation" },
    evebiExpects: "Heating system location code",
    weProvide: "Location string",
    valueMapping: {
      einzelgeraet: "HZ_EINZELOFEN",
      zentralUnbeheizt: "HZ_ZENTRALHEIZUNG", // Central, unheated space
      zentralBeheizt: "HZ_ZENTRALHEIZUNG", // Central, heated space (both map to central)
      fernheizung: "HZ_AUSSERHALB", // District heating is outside
    },
  },
  {
    labelMapping: { Hzg_Kreistemperatur: "heatingCircuitTemperature" },
    evebiExpects: "Heating circuit temperature code",
    weProvide: "Temperature string",
    valueMapping: {
      "90-70": "HKTEMP_90_70",
      "70-55": "HKTEMP_70_55",
      "55-45": "HKTEMP_55_45",
      "35-28": "HKTEMP_35_28",
    },
  },
  {
    labelMapping: { Hzg_Verteilung_Daemmung: "heatingDistributionInsulated" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Hzg_Pufferspeicher: "hasBufferStorage" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  // Hot Water System
  {
    labelMapping: { WW_Verteilung_Art: "hotWaterDistributionType" },
    evebiExpects: "Numeric code: 0, 1, or 2",
    weProvide: "String: dezentral, gebaeudezentral, or wohnungszentral",
    valueMapping: {
      dezentral: "0",
      gebaeudezentral: "1",
      wohnungszentral: "2",
    },
  },
  {
    labelMapping: { WW_Baujahr: "hotWaterYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { WW_Erzeugertyp: "hotWaterTechnology" },
    evebiExpects: "Hot water technology code",
    weProvide: "Technology type string",
    valueMapping: {
      kombiErzeuger: "WT_HZG", // Combined heating system
      elektroSpeicher: "WT_ESP", // Electric storage
      elektroDurchlauf: "WT_EDL", // Electric flow-through
      direktBrennstoffNT: "WT_GASDIR", // Direct fuel low-temp
      direktBrennstoffBW: "WT_GASDIR2", // Direct fuel condensing
      gasDurchlaufNT: "WT_GASDL", // Gas flow-through low-temp
      gasDurchlaufBW: "WT_GASDL2", // Gas flow-through condensing
      solarkollektor: "WT_SOLAR",
      waermepumpe: "WT_WP",
      indirektSpeicher: "WT_indHZG", // Indirect storage from heating
      fernwaerme: "WT_FERNW",
    },
  },
  {
    labelMapping: { WW_Solar: "hotWaterSolar" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { WW_Standort: "hotWaterStorageLocation" },
    evebiExpects: "Location code: 0-2",
    weProvide: "Location string",
    valueMapping: {
      innerhalb: "0",
      keller: "1",
      dach: "2",
    },
  },
  {
    labelMapping: { WW_Zirkulation: "hasHotWaterCirculation" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { WW_Verteilung_Daemmung: "hotWaterDistributionInsulated" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  // Windows
  {
    labelMapping: { Fenster1_Baujahr: "windowYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Fenster1_Art: "windowMaterialGlazing" },
    evebiExpects: "Window type code",
    weProvide: "Window type string",
    valueMapping: {
      holzEinfach: "fb_HolzEinfach",
      holzZweifach: "fb_HolzVerbund",
      holzWaermeschutz: "fb_HolzWSG",
      kunststoffZweifach: "fb_Kunststoff",
      kunststoffWaermeschutz: "fb_KunststoffWSG",
      aluZweifachBis83: "fb_AluBis1983",
      aluZweifachAb84: "fb_AluAb1984",
      aluWaermeschutz: "fb_AluWSG",
      passivhaus: "fb_Passivhaus",
      metalltüren: "fb_TuerenMetall",
    },
  },
  {
    labelMapping: { Fenster1_U_Wert: "windowUValue" },
    evebiExpects: "U-Value as number with comma (e.g., 1,2)",
    weProvide: "Number (convert dot to comma)",
    note: 'Only if windowUValueKnown === "ja"',
  },
  {
    labelMapping: { Fenster1_Fläche: "windowArea" }, //TO BE CALCULATED
    note: "has to be calculated from all the areas provided",
  },

  // Basement/Floor
  {
    labelMapping: { Keller_vorhanden: "hasBasement" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { KD_Aufbau: "basementCeilingConstruction" },
    evebiExpects: "Construction type code",
    weProvide: "Construction type string",
    valueMapping: {
      ziegel: "kb_Massiv",
      holz: "kb_Holz",
      stahlbeton: "kb_Stahlbeton",
    },
  },
  {
    labelMapping: { KD_U_Wert: "basementCeilingUValue" },
    evebiExpects: "U-Value with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: 'Only if basementCeilingUValueKnown === "ja"',
  },
  {
    labelMapping: { Keller_Beheizung: "basementHeatingLevel" },
    evebiExpects: "Heating level code: 0-2",
    weProvide: "Heating level string",
    valueMapping: {
      unbeheizt: "0",
      teilweise: "1",
      voll: "2",
    },
  },
  {
    labelMapping: { Keller_Flaeche: "basementArea" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Keller_Daemmung: "hasBasementInsulation" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Keller_Daemmung_Dicke: "basementInsulationThickness" },
    evebiExpects: "Thickness in cm with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Keller_Daemmung_Flaeche: "basementInsulationAreaPercent" },
    evebiExpects: "Percentage as number with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  // Roof
  {
    labelMapping: { Dach_vorhanden: "hasAttic" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein (Flachdach)",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Dach_Flaeche: "roofArea" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: 'Only if roofAreaKnown === "ja"',
  },
  {
    labelMapping: { Dach_Form: "roofTypeAndPitch" },
    evebiExpects: "Roof type code: 0-5",
    weProvide: "Roof type string",
    valueMapping: {
      sattelSchwach: "0",
      sattelMittel: "1",
      sattelStark: "2",
      pultSchwach: "3",
      pultMittel: "4",
      pultStark: "5",
    },
  },
  {
    labelMapping: { OGD_Typ: "topFloorCeilingType" },
    evebiExpects: "Ceiling type code",
    weProvide: "Ceiling type string",
    valueMapping: {
      massivdecke: "kb_Massiv",
      holzbalken: "kb_Holz",
    },
  },
  {
    labelMapping: { OGD_darueber: "aboveTopFloorCeiling" },
    evebiExpects: "What is above code: 0-1",
    weProvide: "Above type string",
    valueMapping: {
      unbeheizterDachraum: "0",
      nichts: "1",
    },
  },
  {
    labelMapping: { Dach_U_Wert: "roofUValue" },
    evebiExpects: "U-Value with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: 'Only if roofUValueKnown === "ja"',
  },
  {
    labelMapping: { Dach_Daemmung: "hasRoofInsulation" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Dach_Daemmung_Dicke: "roofInsulationThickness" },
    evebiExpects: "Thickness in cm with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Dach_Daemmung_Flaeche: "roofInsulationAreaPercent" },
    evebiExpects: "Percentage with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  // Walls/Facade
  {
    labelMapping: { Wand_Bauweise: "constructionType" },
    evebiExpects: "Construction type code",
    weProvide: "Construction type string",
    valueMapping: {
      massiveKonstruktion: "kb_Massiv",
      holzkonstruktion: "kb_Holz",
      massivZweischalig: "kb_zweischaligOhneDaemm",
      massivwandBis20Vollziegel: "kb_MassivBis20",
      massivwand2030Vollziegel: "kb_Massiv20bis30",
      massivwandUeber30Vollziegel: "kb_Massivueber30",
      sonstMassivwandBis20: "kb_sonstMassbis20",
      sonstMassivwandUeber20: "kb_sonstMassuebber20",
      holzMassiv: "kb_Massivholz",
      fachwerkLehm: "kb_FachwerkLehm",
      fachwerkVollziegel: "kb_FachwerkVollziegel",
      stahlbeton: "kb_Stahlbeton",
    },
  },
  {
    labelMapping: { Wand_U_Wert: "wallUValue" },
    evebiExpects: "U-Value with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: 'Only if wallUValueKnown === "ja"',
  },
  {
    labelMapping: { Fassade_Daemmung: "hasFacadeInsulation" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Fassade_Daemmung_Dicke: "facadeInsulationThickness" },
    evebiExpects: "Thickness in cm with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Fassade_Daemmung_Flaeche: "facadeInsulationAreaPercent" },
    evebiExpects: "Percentage with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  // Ventilation
  {
    labelMapping: { Lueftung_vorhanden: "hasVentilationSystem" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Lueftung_Typ: "ventilationSystemType" },
    evebiExpects: "Ventilation type code",
    weProvide: "Ventilation type string",
    valueMapping: {
      freieLueftung: "LA_FREI",
      abluftanlage: "LA_ABL",
      zuAbluftMitWRG: "LA_WRG",
      zuAbluftOhneWRG: "LA_ABL", // Supply/exhaust without heat recovery is similar to exhaust only
      abluftwaermepumpe: "LA_WP",
    },
  },
  {
    labelMapping: { Lueftung_Baujahr: "ventilationSystemYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Lueftung_Standort: "ventilationSystemLocation" },
    evebiExpects: "Location code: 0-2",
    weProvide: "Location string",
    valueMapping: {
      innerhalb: "0",
      keller: "1",
      dach: "2",
    },
  },
  // Cooling
  {
    labelMapping: { Kuehlung_vorhanden: "hasCooling" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Kuehlung_Flaeche: "cooledArea" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  // Building Geometry
  {
    labelMapping: { Geb_Form: "buildingShape" },
    evebiExpects: "Building shape code: 0-3",
    weProvide: "Building shape string",
    valueMapping: {
      rechteck: "0",
      lForm: "1",
      tForm: "2",
      uForm: "3",
    },
  },
  {
    labelMapping: { Geb_Wandlaenge_a: "wallLengthA" },
    evebiExpects: "Length in m with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Geb_Wandlaenge_b: "wallLengthB" },
    evebiExpects: "Length in m with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Geb_Wandlaenge_c: "wallLengthC" },
    evebiExpects: "Length in m with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: "Only for L, T, U shapes",
  },
  {
    labelMapping: { Geb_Wandlaenge_d: "wallLengthD" },
    evebiExpects: "Length in m with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: "Only for L, T, U shapes",
  },
  {
    labelMapping: { Geb_Wandlaenge_e: "wallLengthE" },
    evebiExpects: "Length in m with comma decimal",
    weProvide: "Number (convert dot to comma)",
    note: "Only for L, T, U shapes",
  },
  {
    labelMapping: { Geb_Geschosshoehe: "averageFloorHeight" },
    evebiExpects: "Height in m with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Geb_Anzahl_Geschosse: "numberOfHeatedFloors" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Geb_Anbau: "buildingAttachment" },
    evebiExpects: "Attachment type code: 0-2",
    weProvide: "Attachment type string",
    valueMapping: {
      freistehend: "0",
      einseitig: "1",
      zweiseitig: "2",
    },
  },
  {
    labelMapping: { Geb_Ausrichtung_a: "sideAOrientation" },
    evebiExpects: "Orientation code: 0-7",
    weProvide: "Orientation string",
    valueMapping: {
      nord: "0",
      nordost: "1",
      ost: "2",
      suedost: "3",
      sued: "4",
      suedwest: "5",
      west: "6",
      nordwest: "7",
    },
  },
] as const;

/**
 * All mappings for Verbrauchsausweis (WG-V) - Consumption-based certificate
 */
export const VERBRAUCHSAUSWEIS_MAPPINGS = [
  // Address & Customer Data
  {
    labelMapping: { Str: "objectStreet" },
    evebiExpects: "string",
    weProvide: "string",
  },
  {
    labelMapping: { HNr: "objectNumber" },
    evebiExpects: "string",
    weProvide: "string",
  },
  {
    labelMapping: { PLZ: "objectZip" },
    evebiExpects: "string",
    weProvide: "string",
  },
  {
    labelMapping: { Ort: "objectCity" },
    evebiExpects: "string",
    weProvide: "string",
  },
  // Building Basic Data
  {
    labelMapping: { Geb_Baujahr: "buildingYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Anz_WE: "numberOfUnits" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { AN: "livingArea" },
    evebiExpects:
      "Living area in m² as number with comma decimal (e.g., 150,5)",
    weProvide: "Number from form (convert dot to comma)",
  },
  {
    labelMapping: { Geb_Kategorie: "buildingType" },
    evebiExpects: "Building type code",
    weProvide: "Building type string",
    valueMapping: {
      einfamilienhaus: "GT_GANZES_GEB",
      zweifamilienhaus: "GT_GANZES_GEB",
      mehrfamilienhaus: "GT_GANZES_GEB",
      wohnteilGemischt: "GT_TEIL_DES_WG", // Part of residential building or mixed use
    },
  },
  // Main Fuel Consumption
  {
    labelMapping: { Energietraeger_1: "mainFuel" },
    evebiExpects: "Fuel type code",
    weProvide: "Fuel type string",
    valueMapping: {
      heizoel: "BK_OEL",
      erdgas: "BK_GAS",
      fluessiggas: "BK_FLUESSIGGAS",
      biogas: "BK_GAS",
      biogasNahe: "BK_GAS",
      bioOel: "BK_OEL",
      strom: "BK_STROM",
      holz: "BK_HOLZ",
      holzpellets: "BK_PELLET",
      holzhackschnitzel: "BK_HHS",
      raumkohle: "BK_KOHLE",
      steinkohle: "BK_KOHLE",
      fernwaermeHeizwerkFossil: "BK_FERNHZ",
      fernwaermeKraftwerkFossil: "BK_PROZESSWAERME",
      fernwaermeKraftwerkErneuerbar: "BK_PROZESSWAERME",
      fernwaermeHeizwerkErneuerbar: "BK_FERNHZ",
      nachtstrom: "BK_NACHTSTR",
    },
  },
  {
    labelMapping: { Verbrauch_Heizung_1: "fuelConsumption1" },
    evebiExpects: "Consumption as number with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Verbrauch_Heizung_2: "fuelConsumption2" },
    evebiExpects: "Consumption as number with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Verbrauch_Heizung_3: "fuelConsumption3" },
    evebiExpects: "Consumption as number with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Leerstand_1: "vacancy1" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Leerstand_Prozent_1: "vacancyPercent1" },
    evebiExpects: "Percentage as number with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Leerstand_2: "vacancy2" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Leerstand_Prozent_2: "vacancyPercent2" },
    evebiExpects: "Percentage with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Leerstand_3: "vacancy3" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Leerstand_Prozent_3: "vacancyPercent3" },
    evebiExpects: "Percentage with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  // Hot Water Preparation
  {
    labelMapping: { WW_Bereitung: "hotWaterPreparation" },
    evebiExpects: "Hot water preparation type code: 0-2",
    weProvide: "Preparation type string",
    valueMapping: {
      included: "0", // Im Heizungsverbrauch enthalten
      separate: "1", // Separat eingeben
      central: "2", // Dezentral
    },
  },
  {
    labelMapping: { WW_Energietraeger: "hotWaterFuel" },
    evebiExpects: "Fuel type code (same as Energietraeger_1)",
    weProvide: "Fuel type string",
    note: 'Only if hotWaterPreparation === "separate"',
    valueMapping: {
      heizoel: "BK_OEL",
      erdgas: "BK_GAS",
      fluessiggas: "BK_FLUESSIGGAS",
      biogas: "BK_GAS",
      biogasNahe: "BK_GAS",
      bioOel: "BK_OEL",
      strom: "BK_STROM",
      holz: "BK_HOLZ",
      holzpellets: "BK_PELLET",
      holzhackschnitzel: "BK_HHS",
      raumkohle: "BK_KOHLE",
      steinkohle: "BK_KOHLE",
      fernwaermeHeizwerkFossil: "BK_FERNHZ",
      fernwaermeKraftwerkFossil: "BK_PROZESSWAERME",
      fernwaermeKraftwerkErneuerbar: "BK_PROZESSWAERME",
      fernwaermeHeizwerkErneuerbar: "BK_FERNHZ",
      nachtstrom: "BK_NACHTSTR",
    },
  },
  {
    labelMapping: { WW_Verbrauch_1: "hotWaterConsumption1" },
    evebiExpects: "Consumption with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { WW_Verbrauch_2: "hotWaterConsumption2" },
    evebiExpects: "Consumption with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { WW_Verbrauch_3: "hotWaterConsumption3" },
    evebiExpects: "Consumption with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  // Second Fuel (Additional Fuels)
  {
    labelMapping: { Weitere_Brennstoffe: "hasAdditionalFuels" },
    evebiExpects: "Boolean: 1 = ja, 0 = nein",
    weProvide: "String: ja or nein",
    valueMapping: {
      ja: "1",
      nein: "0",
    },
  },
  {
    labelMapping: { Energietraeger_2: "secondFuel" },
    evebiExpects: "Fuel type code (same as main fuel)",
    weProvide: "Fuel type string",
    note: 'Only if hasAdditionalFuels === "ja"',
    valueMapping: {
      heizoel: "BK_OEL",
      erdgas: "BK_GAS",
      fluessiggas: "BK_FLUESSIGGAS",
      biogas: "BK_GAS",
      biogasNahe: "BK_GAS",
      bioOel: "BK_OEL",
      strom: "BK_STROM",
      holz: "BK_HOLZ",
      holzpellets: "BK_PELLET",
      holzhackschnitzel: "BK_HHS",
      raumkohle: "BK_KOHLE",
      steinkohle: "BK_KOHLE",
      fernwaermeHeizwerkFossil: "BK_FERNHZ",
      fernwaermeKraftwerkFossil: "BK_PROZESSWAERME",
      fernwaermeKraftwerkErneuerbar: "BK_PROZESSWAERME",
      fernwaermeHeizwerkErneuerbar: "BK_FERNHZ",
      nachtstrom: "BK_NACHTSTR",
    },
  },
  {
    labelMapping: { Verbrauch_2_Brennstoff_1: "secondFuelConsumption1" },
    evebiExpects: "Consumption with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Verbrauch_2_Brennstoff_2: "secondFuelConsumption2" },
    evebiExpects: "Consumption with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Verbrauch_2_Brennstoff_3: "secondFuelConsumption3" },
    evebiExpects: "Consumption with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Hzg_Baujahr_2: "secondHeatingYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
] as const;
