import { questions } from './form-definition_pre_con_questions';

export const getBudgetRangeById = (id: string) => {
  return questions.budgetRanges.find(budget => budget.id === id) || null;
};