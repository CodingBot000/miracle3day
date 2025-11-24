import { questions } from './form-definition';

export const getBudgetRangeById = (id: string) => {
  return questions.budgetRanges.find(budget => budget.id === id) || null;
};