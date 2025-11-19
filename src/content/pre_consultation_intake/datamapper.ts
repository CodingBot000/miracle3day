import { questions } from './form-definition_pre_consultation';

export const getBudgetRangeById = (id: string) => {
  return questions.budgetRanges.find(budget => budget.id === id) || null;
};