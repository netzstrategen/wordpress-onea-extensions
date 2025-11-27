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
    evebiExpects: "Building type code: 0, 1, 2, or 3",
    weProvide: "Building type string",
    valueMapping: {
      einfamilienhaus: "0",
      zweifamilienhaus: "1",
      mehrfamilienhaus: "2",
      wohnteilGemischt: "3",
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
    evebiExpects: "Heating system type code: 0-13",
    weProvide: "Heating system type string",
    valueMapping: {
      niedertemperaturkessel: "0",
      brennwertgeraet: "1",
      nachtspeicher: "2",
      kwk: "3",
      hellstrahler: "4",
      fernheizung: "5",
      dunkelstrahler: "6",
      luftheizung: "7",
      brennstoffzelle: "8",
      solarkollektor: "9",
      sorptionsGaswaermepumpe: "10",
      waermepumpe: "11",
      ofenWechselbrand: "12",
      standardkessel: "13",
    },
  },
  {
    labelMapping: { Hzg_Energietraeger: "fuelType" },
    evebiExpects: "Fuel type code: 0-13",
    weProvide: "Fuel type string",
    valueMapping: {
      biogas: "0",
      biooeel: "1",
      braunkohle: "2",
      fernwaermeKWK: "3",
      fernwaermeHeizwerk: "4",
      erdgas: "5",
      fluessiggas: "6",
      holzhackschnitzel: "7",
      holz: "8",
      steinkohle: "9",
      stromNT: "10",
      heizoel: "11",
      holzpellets: "12",
      strom: "13",
    },
  },
  {
    labelMapping: { Hzg_Aufstellung: "systemTypeAndLocation" },
    evebiExpects: "System location code: 0-3",
    weProvide: "Location string",
    valueMapping: {
      einzelgeraet: "0",
      zentralUnbeheizt: "1",
      zentralBeheizt: "2",
      fernheizung: "3",
    },
  },
  {
    labelMapping: { Hzg_Kreistemperatur: "heatingCircuitTemperature" },
    evebiExpects: "Circuit temperature code: 0-3",
    weProvide: "Temperature string",
    valueMapping: {
      "90-70": "0",
      "70-55": "1",
      "55-45": "2",
      "35-28": "3",
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
    evebiExpects: "Hot water technology code: 0-10",
    weProvide: "Technology type string",
    valueMapping: {
      kombiErzeuger: "0",
      elektroSpeicher: "1",
      elektroDurchlauf: "2",
      direktBrennstoffNT: "3",
      direktBrennstoffBW: "4",
      gasDurchlaufNT: "5",
      gasDurchlaufBW: "6",
      solarkollektor: "7",
      waermepumpe: "8",
      indirektSpeicher: "9",
      fernwaerme: "10",
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
    labelMapping: { Fenster_Baujahr: "windowYear" },
    evebiExpects: "number",
    weProvide: "number",
  },
  {
    labelMapping: { Fenster_Typ: "windowMaterialGlazing" },
    evebiExpects: "Window type code: 0-9",
    weProvide: "Window type string",
    valueMapping: {
      holzEinfach: "0",
      holzZweifach: "1",
      holzWaermeschutz: "2",
      kunststoffZweifach: "3",
      kunststoffWaermeschutz: "4",
      aluZweifachBis83: "5",
      aluZweifachAb84: "6",
      aluWaermeschutz: "7",
      passivhaus: "8",
      metalltüren: "9",
    },
  },
  {
    labelMapping: { Fenster_U_Wert: "windowUValue" },
    evebiExpects: "U-Value as number with comma (e.g., 1,2)",
    weProvide: "Number (convert dot to comma)",
    note: 'Only if windowUValueKnown === "ja"',
  },
  {
    labelMapping: { Fenster_Flaeche_N: "windowOrientationNorth" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Fenster_Flaeche_O: "windowOrientationEast" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Fenster_Flaeche_S: "windowOrientationSouth" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
  },
  {
    labelMapping: { Fenster_Flaeche_W: "windowOrientationWest" },
    evebiExpects: "Area in m² with comma decimal",
    weProvide: "Number (convert dot to comma)",
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
    evebiExpects: "Construction type code: 0-2",
    weProvide: "Construction type string",
    valueMapping: {
      ziegel: "0",
      holz: "1",
      stahlbeton: "2",
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
    evebiExpects: "Ceiling type code: 0-1",
    weProvide: "Ceiling type string",
    valueMapping: {
      massivdecke: "0",
      holzbalken: "1",
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
    evebiExpects: "Construction type code: 0-11",
    weProvide: "Construction type string",
    valueMapping: {
      massiveKonstruktion: "0",
      holzkonstruktion: "1",
      massivZweischalig: "2",
      massivwandBis20Vollziegel: "3",
      massivwand2030Vollziegel: "4",
      massivwandUeber30Vollziegel: "5",
      sonstMassivwandBis20: "6",
      sonstMassivwandUeber20: "7",
      holzMassiv: "8",
      fachwerkLehm: "9",
      fachwerkVollziegel: "10",
      stahlbeton: "11",
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
    evebiExpects: "Ventilation type code: 0-4",
    weProvide: "Ventilation type string",
    valueMapping: {
      freieLueftung: "0",
      abluftanlage: "1",
      zuAbluftMitWRG: "2",
      zuAbluftOhneWRG: "3",
      abluftwaermepumpe: "4",
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
    evebiExpects: "Building type code: 0, 1, 2, or 3",
    weProvide: "Building type string",
    valueMapping: {
      einfamilienhaus: "0",
      zweifamilienhaus: "1",
      mehrfamilienhaus: "2",
      wohnteilGemischt: "3",
    },
  },
  // Main Fuel Consumption
  {
    labelMapping: { Energietraeger_1: "mainFuel" },
    evebiExpects: "Fuel type code: 0-16",
    weProvide: "Fuel type string",
    valueMapping: {
      heizoel: "0",
      erdgas: "1",
      fluessiggas: "2",
      biogas: "3",
      biogasNahe: "4",
      bioOel: "5",
      strom: "6",
      holz: "7",
      holzpellets: "8",
      holzhackschnitzel: "9",
      raumkohle: "10",
      steinkohle: "11",
      fernwaermeHeizwerkFossil: "12",
      fernwaermeKraftwerkFossil: "13",
      fernwaermeKraftwerkErneuerbar: "14",
      fernwaermeHeizwerkErneuerbar: "15",
      nachtstrom: "16",
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
      heizoel: "0",
      erdgas: "1",
      fluessiggas: "2",
      biogas: "3",
      biogasNahe: "4",
      bioOel: "5",
      strom: "6",
      holz: "7",
      holzpellets: "8",
      holzhackschnitzel: "9",
      raumkohle: "10",
      steinkohle: "11",
      fernwaermeHeizwerkFossil: "12",
      fernwaermeKraftwerkFossil: "13",
      fernwaermeKraftwerkErneuerbar: "14",
      fernwaermeHeizwerkErneuerbar: "15",
      nachtstrom: "16",
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
      heizoel: "0",
      erdgas: "1",
      fluessiggas: "2",
      biogas: "3",
      biogasNahe: "4",
      bioOel: "5",
      strom: "6",
      holz: "7",
      holzpellets: "8",
      holzhackschnitzel: "9",
      raumkohle: "10",
      steinkohle: "11",
      fernwaermeHeizwerkFossil: "12",
      fernwaermeKraftwerkFossil: "13",
      fernwaermeKraftwerkErneuerbar: "14",
      fernwaermeHeizwerkErneuerbar: "15",
      nachtstrom: "16",
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
