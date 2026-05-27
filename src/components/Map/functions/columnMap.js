import { pick } from "./pick";

export const COLUMN_MAP = {

  // HSR
  hsr: r => pick(
    r,
    "Регион"
  ),

  // regionSynonyms
  region: r => pick(
    r,
    "Область"
  ),

  // Manager layer
  manager: r => pick(
    r,
    "Позиция менеджера"
  ),

  // Territory layer
  territory: r => pick(
    r,
    "Позиция сотрудника"
  ),

  // Distributor
  distributor: r => pick(
    r,
    "Дистр"
  )

};