import { Formik, Form, Field, ErrorMessage } from 'formik'

import { PORTFOLIO_STATUS_OPTIONS, portfolioFormSchema } from '@/types/portfolio'
import './PortfolioForm.css'

/** Shared by the create and edit screens; owns the fields, validation, and submit/cancel actions. */
export default function PortfolioForm({ initialValues, onSubmit, submitLabel, error, onCancel }) {
  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={portfolioFormSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="portfolio-form" noValidate>
          <div className="portfolio-form-field">
            <label htmlFor="title">Title</label>
            <Field id="title" name="title" type="text" />
            <ErrorMessage name="title" component="span" className="portfolio-form-field-error" />
          </div>

          <div className="portfolio-form-field">
            <label htmlFor="description">Description</label>
            <Field id="description" name="description" as="textarea" rows={4} />
            <ErrorMessage name="description" component="span" className="portfolio-form-field-error" />
          </div>

          <div className="portfolio-form-field">
            <label htmlFor="technology">Technology</label>
            <Field id="technology" name="technology" type="text" placeholder="e.g. React, Node.js" />
            <ErrorMessage name="technology" component="span" className="portfolio-form-field-error" />
          </div>

          <div className="portfolio-form-field">
            <label htmlFor="projectUrl">Project URL</label>
            <Field id="projectUrl" name="projectUrl" type="url" placeholder="https://" />
            <ErrorMessage name="projectUrl" component="span" className="portfolio-form-field-error" />
          </div>

          <div className="portfolio-form-field">
            <label htmlFor="githubUrl">GitHub URL</label>
            <Field id="githubUrl" name="githubUrl" type="url" placeholder="https://" />
            <ErrorMessage name="githubUrl" component="span" className="portfolio-form-field-error" />
          </div>

          <div className="portfolio-form-field">
            <label htmlFor="imageUrl">Image URL</label>
            <Field id="imageUrl" name="imageUrl" type="url" placeholder="https://" />
            <ErrorMessage name="imageUrl" component="span" className="portfolio-form-field-error" />
          </div>

          <div className="portfolio-form-field">
            <label htmlFor="status">Status</label>
            <Field id="status" name="status" as="select">
              <option value="">Select status</option>
              {PORTFOLIO_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Field>
            <ErrorMessage name="status" component="span" className="portfolio-form-field-error" />
          </div>

          {error && <p className="portfolio-form-error">{error}</p>}

          <div className="portfolio-form-actions">
            {onCancel && (
              <button type="button" className="portfolio-form-cancel" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="portfolio-form-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : submitLabel}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
