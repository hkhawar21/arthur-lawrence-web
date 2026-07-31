import * as Yup from 'yup';

import type { CreatePortfolioItemInput, PortfolioItem, PortfolioStatus } from './api';

export const PORTFOLIO_STATUS_OPTIONS: readonly PortfolioStatus[] = [
  'Draft',
  'Active',
  'Completed',
];

/** Form-only representation: every field is a string so it can bind directly to a TextInput. */
export type PortfolioFormValues = {
  title: string;
  description: string;
  technology: string;
  projectUrl: string;
  githubUrl: string;
  imageUrl: string;
  status: PortfolioStatus | '';
};

export const portfolioFormInitialValues: PortfolioFormValues = {
  title: '',
  description: '',
  technology: '',
  projectUrl: '',
  githubUrl: '',
  imageUrl: '',
  status: '',
};

const optionalUrlField = (label: string) =>
  Yup.string()
    .trim()
    .transform((value: string) => (value === '' ? undefined : value))
    .url(`Enter a valid ${label} URL`);

/** Shared by both the create and edit screens via <PortfolioForm />. */
export const portfolioFormSchema = Yup.object({
  title: Yup.string().trim().required('Title is required'),
  description: Yup.string().trim().required('Description is required'),
  technology: Yup.string().trim().required('Technology is required'),
  projectUrl: Yup.string()
    .trim()
    .required('Project URL is required')
    .url('Enter a valid project URL'),
  githubUrl: optionalUrlField('GitHub'),
  imageUrl: optionalUrlField('image'),
  status: Yup.string().oneOf([...PORTFOLIO_STATUS_OPTIONS, ''], 'Select a valid status'),
});

/** Prefills the form when editing; falls back to blank values for the create screen. */
export function toPortfolioFormValues(item?: PortfolioItem | null): PortfolioFormValues {
  if (!item) return portfolioFormInitialValues;

  return {
    title: item.title,
    description: item.description,
    technology: item.technology,
    projectUrl: item.projectUrl,
    githubUrl: item.githubUrl ?? '',
    imageUrl: item.imageUrl ?? '',
    status: item.status ?? '',
  };
}

/**
 * Builds the API payload from form values. The result satisfies both
 * `CreatePortfolioItemInput` and `UpdatePortfolioItemInput` (a partial of it),
 * so it can be passed to either the create or update call.
 */
export function toPortfolioItemInput(values: PortfolioFormValues): CreatePortfolioItemInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    technology: values.technology.trim(),
    projectUrl: values.projectUrl.trim(),
    ...(values.githubUrl.trim() ? { githubUrl: values.githubUrl.trim() } : {}),
    ...(values.imageUrl.trim() ? { imageUrl: values.imageUrl.trim() } : {}),
    ...(values.status ? { status: values.status } : {}),
  };
}
